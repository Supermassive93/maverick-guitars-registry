import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('image') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Image upload not configured' }, { status: 500 })
  }

  const imgbbForm = new FormData()
  imgbbForm.append('key', apiKey)
  imgbbForm.append('image', file)

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: imgbbForm,
  })

  const data = await response.json()

  if (!data.success) {
    return NextResponse.json({ error: 'Upload failed', detail: data.error }, { status: 500 })
  }

  return NextResponse.json({
    url: data.data.url,
    display_url: data.data.display_url,
    thumb: data.data.thumb?.url,
  })
}
