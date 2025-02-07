import { Upload } from 'tus-js-client'
import { config } from 'dotenv'

config()
const tus_api = process.env.TUS_API
const key = process.env.TUSKY_API_KEY
const defaultVault = process.env.DEFAULT_VAULT

function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export async function uploadFile(
  // file: File,
  jsonObject: JSON,
  onLoad: (percentage: number) => void,
  onSuccess: (upload: Upload) => void,
  onError: () => void,
) {
  const jsonBlob = new Blob([JSON.stringify(jsonObject)], { type: 'application/json' })
  if (!tus_api || !key) {
    throw new Error('TUS_API or TUSKY_API_KEY is not set')
  }
  const upload = new Upload(jsonBlob, {
    endpoint: `${tus_api}/uploads`,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    headers: {
      'Api-Key': key,
    },
    metadata: {
      filename: `${generateRandomString(10)}.json`,
      filetype: 'application/json',
      vaultId: defaultVault || 'dfae36c8-dcbd-4e12-b13e-c7cb95be40ba', // ID of the vault where the file will be stored
    },
    uploadSize: jsonBlob.size,
    onError: (error) => {
      onError()
      console.error('Upload failed:', error.message)
    },
    onProgress: (bytesUploaded, bytesTotal) => {
      const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
      onLoad(Number(percentage))
      console.log(`Upload progress: ${percentage}%`)
    },
    onSuccess: () => {
      onSuccess(upload)
    },
  })
  await upload.start()
}

// create vault to store files, Vaults in Tusky are secure storage containers for files.
export async function createVault(vaultName: string) {
  if (!tus_api || !key) {
    throw new Error('TUS_API or TUSKY_API_KEY is not set')
  }
  const response = await fetch(`${tus_api}/vaults`, {
    method: 'POST',
    headers: {
      'Api-Key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: vaultName,
    }),
  })

  const vault = await response.json()
  return vault
}

//get file binary data from id
export async function getDataByID(id: string) {
  if (!tus_api || !key) {
    throw new Error('TUS_API or TUSKY_API_KEY is not set')
  }
  const response = await fetch(`${tus_api}/files/${id}/data`, {
    headers: {
      'Api-Key': key,
    },
  })
  return await response.json()
}

// get all file by a vault
export async function getDataFromVault() {
  if (!tus_api || !key) {
    throw new Error('TUS_API or TUSKY_API_KEY is not set')
  }
  const response = await fetch(`${tus_api}/files?vaultId=${defaultVault}`, {
    headers: {
      'Api-Key': key,
    },
  })
  const data = await response.json()
  return data?.items
}

export async function getFileInfo(id: string) {
  if (!tus_api || !key) {
    throw new Error('TUS_API or TUSKY_API_KEY is not set')
  }
  const response = await fetch(`${tus_api}/files/${id}`, {
    headers: {
      'Api-Key': key,
    },
  })
  return await response.json()
}

// export async function uploadFile(
//   file: File,
//   vaultId: string,
//   onLoad: (percentage: number) => void,
//   onSuccess: () => void,
//   onError: () => void,
// ) {
//   // const jsonBlob = new Blob([JSON.stringify(jsonObject)], { type: "application/json" });

//   const upload = new Upload(file, {
//     endpoint: `${tus_api}/uploads`,
//     retryDelays: [0, 3000, 5000, 10000, 20000],
//     headers: {
//       'Api-Key': key,
//     },
//     metadata: {
//       filename: file.name,
//       filetype: file.type,
//       vaultId: vaultId, // ID of the vault where the file will be stored
//     },
//     uploadSize: file.size,
//     onError: (error) => {
//       onError()
//       console.error('Upload failed:', error.message)
//     },
//     onProgress: (bytesUploaded, bytesTotal) => {
//       const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
//       onLoad(Number(percentage))
//       console.log(`Upload progress: ${percentage}%`)
//     },
//     onSuccess: () => {
//       onSuccess()
//       console.log('Upload finished:', upload.url)
//     },
//   })
//   await upload.start()
// }
