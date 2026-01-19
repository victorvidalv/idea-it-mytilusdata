import type { RequestHandler } from './$types';
import { handleGetProyeccion, handlePostProyeccion } from '../proyeccion/handlers';

export const GET: RequestHandler = (event) => {
	return handleGetProyeccion(event);
};

export const POST: RequestHandler = (event) => {
	return handlePostProyeccion(event);
};
