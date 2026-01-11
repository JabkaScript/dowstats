import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export function createS3Client() {
  const cfg = useRuntimeConfig()
  if (!cfg.s3Key || !cfg.s3Secret) {
    throw new Error('S3 credentials are not configured: set AWS_S3_KEY and AWS_S3_SECRET')
  }
  return new S3Client({
    region: cfg.s3Region,
    endpoint: cfg.s3Endpoint,
    credentials: {
      accessKeyId: cfg.s3Key,
      secretAccessKey: cfg.s3Secret,
    },
  })
}

export function getBucket() {
  const cfg = useRuntimeConfig()
  return cfg.s3Bucket
}

export async function uploadReplay(key: string, data: Uint8Array | Buffer) {
  const s3 = createS3Client()
  const Bucket = getBucket()
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: key,
      Body: data,
      ContentType: 'application/octet-stream',
    })
  )
}

export async function getReplayStream(key: string) {
  const s3 = createS3Client()
  const Bucket = getBucket()
  const res = await s3.send(new GetObjectCommand({ Bucket, Key: key }))
  return res.Body as any // Readable stream
}

export async function ensureReplayExists(key: string) {
  const s3 = createS3Client()
  const Bucket = getBucket()
  await s3.send(new HeadObjectCommand({ Bucket, Key: key }))
}

export async function deleteReplay(key: string) {
  const s3 = createS3Client()
  const Bucket = getBucket()
  await s3.send(new DeleteObjectCommand({ Bucket, Key: key }))
}

export async function getReplaySignedUrl(key: string, filenameForUser?: string, expiresIn = 900) {
  const s3 = createS3Client()
  const Bucket = getBucket()
  const command = new GetObjectCommand({
    Bucket,
    Key: key,
    ResponseContentType: 'application/octet-stream',
    ResponseContentDisposition: filenameForUser
      ? `attachment; filename="${filenameForUser}"`
      : undefined,
  })
  return await getSignedUrl(s3, command, { expiresIn })
}

export function makeReplayKey(originalName: string, gameId: number | string) {
  const safeId = String(gameId)
  const base = originalName.replace(/\.[^.]+$/, '') // strip extension
  return `${base}#${safeId}.rec`
}
