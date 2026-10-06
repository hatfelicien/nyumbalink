/**
 * Automatic screening for user-written reviews. Nothing here publishes or rejects a
 * review on its own — every review still waits for a moderator — it only surfaces the
 * reasons a moderator should look twice.
 */
export function screenReview(comment: string): string[] {
  const flags: string[] = []
  const text = comment.trim()

  if (/(https?:\/\/|www\.)\S+/i.test(text)) flags.push('Contains a link')
  if (/(\+?250|0)7[2389]\d{7}/.test(text.replace(/[\s-]/g, ''))) flags.push('Contains a phone number')
  if (/\b(momo|mobile money|airtel money|send (the )?money|western union|pay (me|first))\b/i.test(text)) {
    flags.push('Mentions payment outside the platform')
  }
  if (text.length >= 20 && text === text.toUpperCase() && /[A-Z]/.test(text)) flags.push('Written in all capitals')
  if (/(.)\1{5,}/.test(text)) flags.push('Repeated characters')

  return flags
}
