export async function unzipFiles(file: File): Promise<File[]> {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(file)
  const files: File[] = []

  await Promise.all(
    Object.entries(zip.files).map(async ([path, zipEntry]) => {
      if (!zipEntry.dir && path.endsWith('.xml')) {
        const content = await zipEntry.async('blob')
        files.push(new File([content], path, { type: 'text/xml' }))
      }
    })
  )

  return files
}