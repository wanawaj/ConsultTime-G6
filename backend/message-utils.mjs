// Shared request validation for the ConsultTime student/faculty messaging MVP.
// The attachment cap is deliberately small until antivirus scanning and object
// storage are added. Files are downloaded as octet-stream, never rendered as HTML.
export const MAX_MESSAGE_FILE = 350_000
const ALLOWED_TYPES = new Set([
  'application/pdf', 'image/png', 'image/jpeg', 'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export function validateMessageInput(data) {
  const recipientId = String(data?.recipientId ?? '').trim()
  const threadId = String(data?.threadId ?? '').trim()
  const subject = String(data?.subject ?? '').trim()
  const body = String(data?.body ?? '').trim()
  if (!recipientId || recipientId.length > 100) throw Error('Choose a recipient.')
  if (!subject || subject.length > 160) throw Error('Subject must contain 1–160 characters.')
  if (!body || body.length > 3000) throw Error('Message must contain 1–3000 characters.')
  if (threadId.length > 100) throw Error('Invalid message thread.')
  let attachment = null
  if (data?.attachment != null) {
    const { name, type, data: content } = data.attachment
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 150 || /[\\/\x00-\x1f]/.test(name)) throw Error('Invalid attachment name.')
    if (!ALLOWED_TYPES.has(type)) throw Error('Use a PDF, PNG, JPG, TXT, or DOCX attachment.')
    if (typeof content !== 'string' || !/^[a-zA-Z0-9+/]+={0,2}$/.test(content)) throw Error('Invalid attachment data.')
    const bytes = Buffer.from(content, 'base64')
    if (!bytes.length || bytes.length > MAX_MESSAGE_FILE || bytes.toString('base64') !== content) throw Error('Attachment must be no larger than 350 KB.')
    attachment = { name: name.trim(), type, bytes }
  }
  return { recipientId, threadId, subject, body, attachment }
}
