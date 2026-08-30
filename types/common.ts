export type CommonResponse = {
  status: 200 | 400 | 500;
  success: boolean;
  message: string;
  data?: any;
};
