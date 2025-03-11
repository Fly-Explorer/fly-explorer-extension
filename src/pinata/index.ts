import { DeleteResponse, FileListItem, FileListResponse, GroupListResponse, GroupResponseItem, PinataSDK, UpdateGroupFilesResponse } from 'pinata'

// PINATA
export const pinata = new PinataSDK({
  pinataJwt: process.env.VITE_PINATA_JWT!,
  pinataGateway: process.env.VITE_PINATA_GATEWAY!,
})

// FILE
const createFile = (data: any, fileName: string) => {
  const _fileName = `${fileName}-${generateRandomString(10)}`
  const file = new File([JSON.stringify(data)], _fileName, { type: 'application/json' })
  return file
}
const createFileJson = (data: any, fileName: string) => {
  const _fileName = `${fileName}-${generateRandomString(10)}`
  const content = JSON.stringify(data);
  const file = new File([JSON.stringify(data)], _fileName, { type: 'application/json' })
  return file
}

const listFilePublic = async () => {
  const files: FileListResponse = await pinata.files.public.list()
  return files
}

const updateMetadataPublic = async (id: string, name: string, keyvalues: any) => {
  const metadata:FileListItem = await pinata.files.public.update({
    id,
    name,
    keyvalues,
  })
  return metadata
}

const deleteFilePublic = async (id: string) => {
  const deletedFiles: DeleteResponse[] = await pinata.files.public.delete([id])
  return deletedFiles
}

// UPLOAD

async function createGroupPublic(groupName: string) {
  const group: GroupResponseItem = await pinata.groups.public.create({
    name: groupName,
  })
  return group
}

async function getGroupByGroupId(groupId: string) {
  const group: GroupResponseItem = await pinata.groups.public.get({
    groupId
  })
  return group
}

async function getListGroup() {
  const groups: GroupListResponse = await pinata.groups.public.list()
  return groups
}

async function addFilesToGroup(groupId: string, files: string[]) {
  const group: UpdateGroupFilesResponse[] = await pinata.groups.public.addFiles({
    groupId,
    files,
  })
  return group
}

async function addFilesToGroupPublic(data: any, fileName: string, groupId: string) {
  try {
    const file = createFile(data, fileName)
    const upload = await pinata.upload.public.file(file).group(groupId)
    return upload
  } catch (error) {
    console.log(error)
  }
}

// GROUP

async function getGroupPinataByName(groupName: string) {
  const groups: GroupListResponse = await pinata.groups.public.list().name(groupName)
  return groups
}


function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const PinataApi = {
  pinata,
  generateRandomString,
  getGroupPinataByName,
  createFile,
  createGroupPublic,
  getGroupByGroupId,
  getListGroup,
  addFilesToGroup,
  addFilesToGroupPublic,
  deleteFilePublic,
  updateMetadataPublic,
  listFilePublic,
}
