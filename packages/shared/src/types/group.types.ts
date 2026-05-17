export type ContributionFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
export type GroupStatus = 'SETUP' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED'
export type MemberRole = 'ADMIN' | 'MEMBER'
export type MemberStatus = 'PENDING' | 'ACTIVE' | 'REMOVED'
 
export interface Group {
  id: string
  name: string
  description: string | null
  contributionAmount: number
  frequency: ContributionFrequency
  status: GroupStatus
  platformFeePercent: number
  createdAt: Date
  memberCount?: number
}

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  role: MemberRole
  status: MemberStatus
  joinedAt: Date | null
  user?: Pick<import('./user.types').User, 'id' | 'displayName' | 'phone'>
}
 
export interface CreateGroupDto {
  name: string
  description?: string
  contributionAmount: number
  frequency: ContributionFrequency
}
 
export interface InviteMemberDto {
  phone: string
}
