import type { Actions } from './$types';
import { load } from './load';
import * as actionsModule from './actions';

export { load };
export const actions = actionsModule satisfies Actions;