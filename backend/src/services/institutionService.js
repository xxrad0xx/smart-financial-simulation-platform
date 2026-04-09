import { prisma } from '../db/prisma.js'
import { defaultInstitutionProfile } from './seedDefaults.js'

export async function getInstitutionProfile() {
  const existing = await prisma.institutionalProfile.findUnique({ where: { id: 'default' } })
  if (existing) return existing
  return await prisma.institutionalProfile.create({
    data: { id: 'default', ...defaultInstitutionProfile },
  })
}

export async function updateInstitutionProfile(next) {
  await getInstitutionProfile()
  return await prisma.institutionalProfile.update({
    where: { id: 'default' },
    data: {
      ...next,
      logoDataUrl: next.logoDataUrl ?? null,
    },
  })
}

