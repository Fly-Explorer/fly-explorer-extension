import { Upload } from 'tus-js-client'
import { config } from 'dotenv'

config()

const tus_api = "https://api.tusky.io"
const key = "0eccf2a3-0be1-471e-a6d2-ab24da6678a3"
const defaultVaultId = "f216f492-9426-4fb5-9b17-8c226806d498"
const defaultParentId = "45c6c728-6e0d-4260-8c2e-1bb25d285874"

function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

//to check that user have been created a folder and create if not
export async function checkUserFolder(folderName: string) {
  if (!tus_api || !key) return 'TUS_API or TUSKY_API_KEY is not set'
  const folders = await fetch(
    `${tus_api}/folders?vaultId=${defaultVaultId}&parentId=${defaultParentId}`,
    {
      method: 'GET',
      headers: {
        'Api-Key': key,
      },
    },
  ).then((response) => response.json())
  console.log(folders)
  const folder = folders.items.find((folder: any) => folder.name == folderName)
  if (folder) {
    return folder
  } else {
    console.log('Creating new folder..')
    return createFolder(folderName)
  }
  //get list folder
}

// to upload file users folder
export async function uploadFile(
  jsonObject: JSON,
  folderName: string,
  onLoad: (percentage: number) => void,
  onSuccess: (upload: Upload) => void,
  onError: () => void,
) {
  console.log('Uploading file... iner')
  if (!tus_api || !key || !defaultVaultId) {
    console.log('TUS_API or TUSKY_API_KEY is not set')
    throw new Error('TUS_API or TUSKY_API_KEY is not set')
  }
  // const folder = await checkUserFolder(folderName)
  // console.log(folder)
  const jsonBlob = new Blob([JSON.stringify(jsonObject)], { type: 'application/json' })

  console.log('Uploading file...')
  const upload = new Upload(jsonBlob, {
    endpoint: `${tus_api}/uploads`,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    headers: {
      'Api-Key': key,
    },
    metadata: {
      filename: `${generateRandomString(10)}.json`,
      filetype: 'application/json',
      vaultId: defaultVaultId, // ID of the vault where the file will be stored
      // parentId: folder.id, // ID of the folder where the file will be stored
      parentId: defaultParentId
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
export async function getDataFromVault(vaultId: string) {
  if (!tus_api || !key) {
    throw new Error('TUS_API or TUSKY_API_KEY is not set')
  }
  const response = await fetch(`${tus_api}/files?vaultId=${vaultId}`, {
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

export async function createFolder(folderName: string) {
  try {
    if (!tus_api || !key) {
      throw new Error('TUS_API or TUSKY_API_KEY is not set')
    }
    const response = await fetch(`${tus_api}/folders`, {
      method: 'POST',
      headers: {
        'Api-Key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        vaultId: defaultVaultId,
        parentId: defaultParentId,
      }),
    })
    return await response.json()
  } catch (error) {
    return error
  }
}

//sapmle parent 2f3e73f9-77c2-473a-b8cd-0776e1b79cc3
