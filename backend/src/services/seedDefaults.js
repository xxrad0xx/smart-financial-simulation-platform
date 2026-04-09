import {
  DEFAULT_CHARGES,
  DEFAULT_CREDIT_PRODUCTS,
  DEFAULT_INVESTMENT_PRODUCTS,
} from '../../../src/data/catalogs.js'

export const defaultInstitutionProfile = {
  nombre: 'Institución Financiera Demo',
  ruc: '1790012345001',
  direccion: 'Av. Principal 123, Quito',
  telefonos: '+593 2 000 0000',
  email: 'contacto@institucion.demo',
  lema: 'Tu aliado en crédito e inversión',
  pieDocumentos:
    'Este documento es referencial. Las condiciones definitivas se formalizan en el contrato respectivo.',
  colorPrimario: '#0284c7',
  colorSecundario: '#0f172a',
  logoDataUrl: null,
}

export const defaultCatalog = {
  creditProducts: DEFAULT_CREDIT_PRODUCTS,
  charges: DEFAULT_CHARGES,
  investmentProducts: DEFAULT_INVESTMENT_PRODUCTS,
}

