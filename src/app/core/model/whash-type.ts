export interface WashRecord {
  id: string;
  userId: string;
  vehicleId: string;
  washDate: Date;
  washType: string;
  status: 'completed' | 'pending' | 'cancelled';
  location: string;
}

export interface WashProgress {
  current: number;
  total: number;
  percentage: number;
}