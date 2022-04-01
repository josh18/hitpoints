import { TypedUseSelectorHook, useSelector as useSelectorBase } from 'react-redux';

import { StoreState } from '../store';

export const useSelector: TypedUseSelectorHook<StoreState> = useSelectorBase;
