export type ContributionStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'
export type TransactionType = 'CONTRIBUTION' | 'PAYOUT' | 'PLATFORM_FEE' | 'REFUND'
 
export interface Contribution {
  id: string
  groupId: string
  userId: string
  amount: number
  status: ContributionStatus
  mpesaRef: string | null
  dueDate: Date
  paidAt: Date | null
}
 
export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  reference: string
  createdAt: Date
}
 
export interface MpesaCallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
      Item: Array<{ Name: string; Value: string | number }>
      }
    }
  }
}
