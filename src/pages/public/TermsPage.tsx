const SECTIONS = [
  {
    title: '1. Using NyumbaLink',
    body: 'NyumbaLink is a listings platform that connects tenants and property owners across Kigali. We do not own, manage, or inspect any property listed on the platform, and we are not a party to any lease agreement made between a tenant and an owner.',
  },
  {
    title: '2. Owner accounts',
    body: 'Owner accounts are subject to review before listings can be published. NyumbaLink may suspend or remove an owner account or listing that is found to be inaccurate, fraudulent, or in violation of these terms.',
  },
  {
    title: '3. Accuracy of listings',
    body: 'Owners are responsible for the accuracy of the information they publish, including price, availability, and photographs. Tenants should independently verify listing details before entering into any agreement.',
  },
  {
    title: '4. Communication',
    body: 'Messages sent through the enquiry form are shared directly with the property owner. NyumbaLink does not moderate or store the content of arrangements made outside the platform.',
  },
  {
    title: '5. Limitation of liability',
    body: 'NyumbaLink is provided on an as-is basis. We are not liable for disputes, losses, or damages arising from a rental arrangement made through listings found on the platform.',
  },
  {
    title: '6. Changes to these terms',
    body: 'We may update these terms from time to time. Continued use of NyumbaLink after a change is posted constitutes acceptance of the updated terms.',
  },
]

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-navy-900 dark:text-white">Terms of service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated 1 August 2026</p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-slate-500">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
