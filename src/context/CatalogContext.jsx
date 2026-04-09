import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_CHARGES,
  DEFAULT_CREDIT_PRODUCTS,
  DEFAULT_INVESTMENT_PRODUCTS,
} from '../data/catalogs.js'
import { api } from '../lib/api.js'

const fallbackCatalog = {
  creditProducts: DEFAULT_CREDIT_PRODUCTS,
  charges: DEFAULT_CHARGES,
  investmentProducts: DEFAULT_INVESTMENT_PRODUCTS,
}

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState(fallbackCatalog)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    api
      .getCatalog()
      .then((data) => {
        if (!alive) return
        setCatalog({
          creditProducts: data.creditProducts ?? DEFAULT_CREDIT_PRODUCTS,
          charges: data.charges ?? DEFAULT_CHARGES,
          investmentProducts: data.investmentProducts ?? DEFAULT_INVESTMENT_PRODUCTS,
        })
        setError(null)
      })
      .catch((e) => {
        if (!alive) return
        setError(e)
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const persist = async (next) => {
    setCatalog(next)
    try {
      const saved = await api.putCatalog(next)
      setCatalog({
        creditProducts: saved.creditProducts ?? DEFAULT_CREDIT_PRODUCTS,
        charges: saved.charges ?? DEFAULT_CHARGES,
        investmentProducts: saved.investmentProducts ?? DEFAULT_INVESTMENT_PRODUCTS,
      })
      setError(null)
    } catch (e) {
      setError(e)
      throw e
    }
  }

  const value = useMemo(
    () => ({
      creditProducts: catalog.creditProducts,
      charges: catalog.charges,
      investmentProducts: catalog.investmentProducts,
      loading,
      error,
      setCreditProducts: (creditProducts) => persist({ ...catalog, creditProducts }),
      setCharges: (charges) => persist({ ...catalog, charges }),
      setInvestmentProducts: (investmentProducts) => persist({ ...catalog, investmentProducts }),
      resetCatalog: () => {
        persist(fallbackCatalog)
      },
    }),
    [catalog, loading, error],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog dentro de CatalogProvider')
  return ctx
}
