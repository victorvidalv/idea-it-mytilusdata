import type { PageServerLoad, Actions } from './$types';
import { load as loadFn } from './load';
import { actions as actionsObj } from './actions';

export const load: PageServerLoad = loadFn;
export const actions: Actions = actionsObj;