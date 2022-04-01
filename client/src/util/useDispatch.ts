import { useDispatch as useDispatchBase } from 'react-redux';

import { Dispatch } from '../store';

export const useDispatch = () => useDispatchBase<Dispatch>();
