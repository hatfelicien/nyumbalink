import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { StepBasics } from '../../components/dashboard/wizard/StepBasics'
import { StepDetails } from '../../components/dashboard/wizard/StepDetails'
import { StepLocation } from '../../components/dashboard/wizard/StepLocation'
import { StepPhotos } from '../../components/dashboard/wizard/StepPhotos'
import { StepReview } from '../../components/dashboard/wizard/StepReview'
import { WizardProgressBar } from '../../components/dashboard/wizard/WizardProgressBar'
import { DEFAULT_WIZARD_VALUES, STEP_FIELDS, WIZARD_STEPS, wizardSchema } from '../../components/dashboard/wizard/wizardSchema'
import type { WizardValues } from '../../components/dashboard/wizard/wizardSchema'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { propertiesService } from '../../services/propertiesService'
import type { Amenity, ListingStatus, Property, PropertyType } from '../../types'
import { distanceKm } from '../../utils/constants'
import { completeMonthlyCosts, findDuplicates } from '../../utils/verification'

const STEP_COMPONENTS = [StepBasics, StepDetails, StepLocation, StepPhotos, StepReview]

function toWizardValues(property: Property): WizardValues {
  return {
    title: property.title,
    type: property.type,
    purpose: property.purpose,
    description: property.description,
    price: property.price,
    negotiable: property.negotiable,
    cautionMoney: property.cautionMoney,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sizeSqm: property.sizeSqm,
    furnished: property.furnished,
    amenities: property.amenities,
    address: property.address,
    coordinates: property.coordinates,
    locationPrecision: property.locationPrecision,
    monthlyCosts: property.monthlyCosts,
    videoUrl: property.videoUrl ?? '',
    images: property.images.map((url, index) => ({ url, isCover: index === 0 })),
  }
}

export function PropertyWizardPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const { data: existing, loading: loadingExisting } = useAsync(
    () => (id ? propertiesService.getById(id) : Promise.resolve(undefined)),
    [id],
  )

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: DEFAULT_WIZARD_VALUES,
    mode: 'onSubmit',
  })

  useEffect(() => {
    if (existing) form.reset(toWizardValues(existing))
    // form.reset is stable across renders; only re-run when the loaded property changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing])

  async function goNext() {
    const valid = await form.trigger(STEP_FIELDS[step])
    if (valid) setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1))
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSave(listingStatus: ListingStatus) {
    const valid = await form.trigger()
    if (!valid) {
      const errorStep = STEP_FIELDS.findIndex((fields) => fields.some((f) => !!form.formState.errors[f]))
      setStep(errorStep === -1 ? 0 : errorStep)
      return
    }

    setSaving(true)
    const values = form.getValues()
    const orderedImages = [...values.images].sort((a, b) => Number(b.isCover) - Number(a.isCover))

    const isRent = values.purpose === 'rent'
    const amenities = values.amenities as Amenity[]
    const images = orderedImages.map((img) => img.url)
    const type = values.type as PropertyType
    const coordinates = { lat: values.coordinates.lat, lng: values.coordinates.lng }

    // Publishing something that looks like another account's listing is held for an admin instead of going live.
    let status = listingStatus
    if (listingStatus === 'published') {
      const others = await propertiesService.list()
      const duplicates = findDuplicates(
        { id, title: values.title, coordinates, type, bedrooms: values.bedrooms, ownerId: user!.id, images },
        others,
      ).filter((match) => match.property.ownerId !== user!.id)
      if (duplicates.length > 0) status = 'pending'
    }

    // A verified badge covers a specific home: moving the pin or the address means it must be checked again.
    const relocated =
      !!existing && (existing.address !== values.address || distanceKm(existing.coordinates, coordinates) > 0.1)
    const verification = existing && !relocated ? existing.verification : ('unverified' as const)

    const payload = {
      title: values.title,
      description: values.description,
      price: values.price,
      type,
      purpose: values.purpose,
      negotiable: values.negotiable,
      cautionMoney: isRent ? values.cautionMoney : 0,
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,
      sizeSqm: values.sizeSqm,
      furnished: values.furnished,
      amenities,
      status: existing?.status ?? ('available' as const),
      listingStatus: status,
      images,
      videoUrl: values.videoUrl || undefined,
      address: values.address,
      city: 'Kigali',
      district: values.address,
      coordinates,
      locationPrecision: values.locationPrecision,
      monthlyCosts: completeMonthlyCosts(isRent ? values.monthlyCosts : {}),
      verification,
      verifiedAt: verification === 'verified' ? existing?.verifiedAt : undefined,
      upi: verification === 'verified' ? existing?.upi : undefined,
      ownerId: user!.id,
    }

    if (isEditing && id) {
      await propertiesService.update(id, payload)
    } else {
      await propertiesService.create(payload)
    }

    if (status === 'pending' && listingStatus === 'published') {
      showToast('Held for review', {
        description: 'This looks very similar to an existing listing, so an admin will check it before it goes live.',
        variant: 'warning',
      })
    } else if (existing?.verification === 'verified' && relocated) {
      showToast('Property updated', {
        description: 'The location changed, so the verified badge was removed. Submit the documents again under Verification.',
        variant: 'warning',
      })
    } else if (isEditing) {
      showToast('Property updated', { variant: 'success' })
    } else {
      showToast(listingStatus === 'published' ? 'Property published' : 'Draft saved', {
        description: listingStatus === 'published' ? 'Next: verify it under Verification to earn the badge.' : undefined,
        variant: 'success',
      })
    }

    setSaving(false)
    navigate('/owner/properties')
  }

  if (isEditing && loadingExisting) {
    return <Skeleton className="h-96 w-full" />
  }

  const StepComponent = STEP_COMPONENTS[step]
  const isLastStep = step === WIZARD_STEPS.length - 1

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <WizardProgressBar steps={WIZARD_STEPS} currentStep={step} />

        <div className="mt-8">
          <StepComponent form={form} />
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-navy-700/10 pt-6 dark:border-navy-700">
          <Button variant="ghost" onClick={goBack} disabled={step === 0} icon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>

          {isLastStep ? (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => handleSave('draft')} loading={saving}>
                Save as draft
              </Button>
              <Button onClick={() => handleSave('published')} loading={saving}>
                Publish
              </Button>
            </div>
          ) : (
            <Button onClick={goNext} icon={<ArrowRight className="h-4 w-4" />}>
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
