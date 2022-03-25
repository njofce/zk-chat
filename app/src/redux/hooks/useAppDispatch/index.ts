import { Dispatch } from "react"
import { useDispatch } from "react-redux"
import { AnyAction } from "redux"
import { AppDispatch } from "../../store"

export const useAppDispatch = (): Dispatch<AnyAction> =>
  useDispatch<AppDispatch>()
