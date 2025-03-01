import { PinataSDK } from 'pinata-web3'

const pinata = new PinataSDK({
  //   pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkZDkyNDM1OC0zNjQzLTRhOWMtYjJmOS1lMDIyMjNlYzcwZWUiLCJlbWFpbCI6ImZseWZpc2gub250aGVnb0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYjA0YWJlNjRlNmI5NDZmMDVhMjgiLCJzY29wZWRLZXlTZWNyZXQiOiJmN2I0MTI4NjNmOTQ4MWUwOTBjN2QwY2Q5NjBkMzhhZGM3YThiMTg2OTIyZTE0MWViZDBmOWU1MmI4NmJhYjE5IiwiZXhwIjoxNzcyMzU4Nzg3fQ.TIs8QBjePc2L45RoUA-GNaFwjwfVAvhm9PSCqlQZgEw",
  pinataJwt: process.env.VITE_PINATA_JWT!,
  pinataGateway: process.env.VITE_PINATA_GATEWAY!,
})

const groupId = 'd70b80a9-7c59-4f2f-896d-3c52f815906f'
const groupInfo = {
  createdAt: '2025-03-01T09:20:00.181Z',
  id: 'd70b80a9-7c59-4f2f-896d-3c52f815906f',
  name: 'Aptos',
  updatedAt: '2025-03-01T09:20:00.181Z',
  user_id: 'dd924358-3643-4a9c-b2f9-e02223ec70ee',
}

const createFile = (data: any, fileName: string) => {
  const file = new File([JSON.stringify(data)], fileName, { type: 'text/plain' })
  return file
}

async function uploadFile(data: any, fileName: string) {
    try {
      const file = createFile(data, fileName)
      const upload = await pinata.upload.file(file)
      console.log('🚀 ~ uploadFile ~ upload:', upload)
    } catch (error) {
      console.log(error)
    }
}

async function getGroupPinata(groupName: string) {
  const groups = await pinata.groups.list().name(groupName)
  console.log('🚀 ~ getGroupPinata ~ groups:', groups)
  return groups
}

async function uploadFileToGroup(data: any, fileName: string) {
  try {
    const file = createFile(data, fileName)
    const upload = await pinata.upload.file(file).group(groupId);
    console.log('🚀 ~ uploadFile ~ uploadToGroup:', upload)
  } catch (error) {
    console.log(error)
  }
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

export { pinata, uploadFile, generateRandomString, uploadFileToGroup }
