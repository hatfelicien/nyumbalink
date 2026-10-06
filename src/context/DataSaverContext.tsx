import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS, storage } from '../utils/storage'

interface DataSaverContextValue {
  dataSaver: boolean
  setDataSaver: (enabled: boolean) => void
}

const DataSaverContext = createContext<DataSaverContextValue | undefined>(undefined)

interface NetworkInformation {
  saveData?: boolean
  effectiveType?: string
}

/** Starts on when the phone asks for reduced data, or reports a 2G-class connection. */
function detectSlowConnection() {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  return Boolean(connection?.saveData) || /2g/.test(connection?.effectiveType ?? '')
}

export function DataSaverProvider({ children }: { children: ReactNode }) {
  const [dataSaver, setDataSaverState] = useState<boolean>(
    () => storage.get<boolean>(STORAGE_KEYS.dataSaver) ?? detectSlowConnection(),
  )

  const setDataSaver = useCallback((enabled: boolean) => {
    setDataSaverState(enabled)
    storage.set(STORAGE_KEYS.dataSaver, enabled)
  }, [])

  return <DataSaverContext.Provider value={{ dataSaver, setDataSaver }}>{children}</DataSaverContext.Provider>
}

export function useDataSaver() {
  const context = useContext(DataSaverContext)
  if (!context) throw new Error('useDataSaver must be used within a DataSaverProvider')
  return context
}
