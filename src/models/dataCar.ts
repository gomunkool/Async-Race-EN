export type CarDataType = {
  name: string;
  color: string;
  id: number;
  velocity?: number;
  distance?: number
};


export const data: CarDataType[] = [
  {
    name: 'Honda',
    color: '#1f2452',
    id: 1
  },
  {
    name: 'BMW',
    color: '#123456',
    id: 2
  },
  {
    name: 'RENO',
    color: '#234f9f',
    id: 1
  },
]