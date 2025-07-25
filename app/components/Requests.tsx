/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { toast } from 'sonner'
import { Loader2Icon } from 'lucide-react'
import api from '@/lib/api'

const currentMonth = new Date().getMonth() + 1

const fetchRequestsCount = async (status: string): Promise<number> => {
  try {
    const response = await api.get(`/requests?status=${status}&month=${currentMonth}&action=count`)
    return typeof response === 'number' ? response : response?.data ?? 0
  } catch (error) {
    console.error(error)
    throw new Error(`No se pudo obtener la cantidad de solicitudes ${status}`)
  }
}

export const PendingRequests = () => {
  const [requests, setRequests] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const count = useMotionValue(requests)
  const rounded = useTransform(count, (value) => Math.round(value))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRequestsCount('pending')
        setRequests(data)
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (requests > 0) {
      const controls = animate(count, requests, { duration: 0.25 })
      return () => controls.stop()
    }
  }, [requests, count])

  return isLoading ? (
    <Loader2Icon className="animate-spin" />
  ) : (
    <div className="flex flex-row flex-wrap text-orange-500 items-center">
      <motion.pre>{rounded}</motion.pre>
    </div>
  )
}

export const PaidRequests = () => {
  const [paidRequests, setPaidRequests] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const count = useMotionValue(paidRequests)
  const rounded = useTransform(count, (value) => Math.round(value))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRequestsCount('paid')
        setPaidRequests(data)
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (paidRequests > 0) {
      const controls = animate(count, paidRequests, { duration: 0.25 })
      return () => controls.stop()
    }
  }, [paidRequests, count])

  return isLoading ? (
    <Loader2Icon className="animate-spin" />
  ) : (
    <div className="flex flex-row flex-wrap text-green-500 items-center">
      <motion.pre>{rounded}</motion.pre>
    </div>
  )
}

export const RejectedRequests = () => {
  const [rejectedRequests, setRejectedRequests] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const count = useMotionValue(rejectedRequests)
  const rounded = useTransform(count, (value) => Math.round(value))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRequestsCount('rejected')
        setRejectedRequests(data)
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (rejectedRequests > 0) {
      const controls = animate(count, rejectedRequests, { duration: 0.25 })
      return () => controls.stop()
    }
  }, [rejectedRequests, count])

  return isLoading ? (
    <Loader2Icon className="animate-spin" />
  ) : (
    <div className="flex flex-row flex-wrap text-red-500 items-center">
      <motion.pre>{rounded}</motion.pre>
    </div>
  )
}

export const InRepositionRequests = () => {
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const count = useMotionValue(total)
  const rounded = useTransform(count, (value) => Math.round(value))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/requests?status=in_reposition')
        const dataArray = Array.isArray(response)
          ? response
          : response.data || Object.values(response).filter((r) => typeof r === 'object')

        const now = new Date()
        const count = dataArray.filter((r: any) => {
          const d = new Date(r.created_at || r.updated_at)
          return d.getMonth() + 1 === now.getMonth() + 1 && d.getFullYear() === now.getFullYear()
        }).length

        setTotal(count)
      } catch (error) {
        console.error(error)
        toast.error('Error al obtener datos de reposiciones en proceso')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (total > 0) {
      const controls = animate(count, total, { duration: 0.25 })
      return () => controls.stop()
    }
  }, [total, count])

  return isLoading ? (
    <Loader2Icon className="animate-spin" />
  ) : (
    <span className="flex flex-row items-center justify-center w-min">
      <motion.pre>{rounded}</motion.pre>
    </span>
  )
}

export const RepositionRequests = () => {
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const count = useMotionValue(total)
  const rounded = useTransform(count, (value) => Math.round(value))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reposiciones?status=pending')
        const dataArray = Array.isArray(response)
          ? response
          : response.data || Object.values(response).filter((r) => typeof r === 'object')

        const now = new Date()
        const count = dataArray.filter((r: any) => {
          const d = new Date(r.created_at || r.updated_at)
          return d.getMonth() + 1 === now.getMonth() + 1 && d.getFullYear() === now.getFullYear()
        }).length

        setTotal(count)
      } catch (error) {
        console.error(error)
        toast.error('Error al obtener datos de reposiciones pendientes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (total > 0) {
      const controls = animate(count, total, { duration: 0.25 })
      return () => controls.stop()
    }
  }, [total, count])

  return isLoading ? (
    <Loader2Icon className="animate-spin" />
  ) : (
    <span className="flex flex-row items-center justify-center w-min">
      <motion.pre>{rounded}</motion.pre>
    </span>
  )
}
