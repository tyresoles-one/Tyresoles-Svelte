export const RespCenters: Array<{ code: string; name: string }> = [
	{ code: 'BEL', name: 'Belgaum' },
	{ code: 'JBP', name: 'Jabalpur' },
	{ code: 'AHM', name: 'Ahemdabad' },
	{ code: 'MAN', name: 'Mangalore (Rubber)' },
	{ code: 'ECO-B', name: 'Ecoflex Bgm' },
	{ code: 'ECO-M', name: 'Ecoflex Mum' },
	{ code: 'BNG', name: 'Bangalore' },
	{ code: 'DEL', name: 'Delhi' },
	{ code: 'GOA', name: 'Goa' },
	{ code: 'HO', name: 'Head Office' },
	{ code: 'MNG', name: 'Mangalore' },
	{ code: 'MUM', name: 'Mumbai' },
	{ code: 'PUN', name: 'Pune' }
];

export const SalesRespCenters: Array<{ code: string; name: string }> = RespCenters.filter((el) => {
	return ['BEL', 'JBP', 'AHM', 'ECO-B', 'ECO-M', 'MAN'].includes(el.code);
});

export const TyreFactories: Array<{ code: string; name: string }> = RespCenters.filter((el) => {
	return ['BEL', 'JBP', 'AHM'].includes(el.code);
});

export const TyreFactoriesActive: Array<{ code: string; name: string }> = RespCenters.filter((el) => {
	return ['BEL', 'JBP'].includes(el.code);
});
export const TileFactories: Array<{ code: string; name: string }> = RespCenters.filter((el) => {
	return ['ECO-B', 'ECO-M'].includes(el.code);
});
export const RubberFactories: Array<{ code: string; name: string }> = RespCenters.filter((el) => {
	return ['MAN'].includes(el.code);
});

export const filterRespCenters = (
	respCenters: string[],
	type: 'default' | 'tyre' | 'tile' | 'rubber' | 'sales' = 'default'
): Array<{ code: string; name: string }> => {
	let arr: Array<{ code: string; name: string }> = RespCenters;
	switch (type) {
		case 'rubber': {
			arr = [...RubberFactories];
			break;
		}
		case 'sales': {
			arr = [...SalesRespCenters];
			break;
		}
		case 'tile': {
			arr = [...TileFactories];
			break;
		}
		case 'tyre': {
			arr = [...TyreFactories];
			break;
		}
	}
	return arr.filter((el) => (respCenters ? respCenters.includes(el.code) : true));
};

export const getValidTyreRespCenter = (respCenter: string = ''): string => {
	const index = ['BEL', 'JBP', 'AHM'].indexOf(respCenter);
	return index > -1 ? respCenter : 'BEL';
};
