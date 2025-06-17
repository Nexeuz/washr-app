
export interface Vehicle {
  id: string;
  userId: string;
  name: string;
  licensePlate: string;
  type: string;
  imageUrl?: string;
  isTaxi: boolean;
  createdAt: Date;
}

