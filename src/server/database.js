import PgPromise from 'pg-promise';

const pgIdent = PgPromise.as.name;

export function extendPGP(obj) {
	obj.first = first;
	obj.insert = insert;
	obj.update = update;
	obj.save = save;
	obj.delete = del;
	obj.selectOne = selectOne;
	obj.selectNone = selectNone;
	obj.selectMany = selectMany;
	obj.selectAny = selectAny;
	obj.selectOneOrNone = selectOneOrNone;
}

export function setPGPTypeDefaults(types) {
//select typname, oid, typarray from pg_type order by oid
	types.setTypeParser(1042, s => s ? s.trim() : s); // bpchar / CHARACTER(X)
	types.setTypeParser(1082, s => s); // DATE
	types.setTypeParser(1114, s => s); // TIMESTAMP
	types.setTypeParser(1184, s => s); // TIMESTAMPTZ
// 1083
// 1115
// 1182
// 1183
}

function insert(table, idColumn, values) {
	if (idColumn && (typeof idColumn == 'object')) {
		values = idColumn;
		idColumn = table+'_id';
	}
	values = values || {};

	const columns = Object.keys(values);

	const columnsSQL = (columns.length ? '('+columns.map(pgIdent).join(',')+')' : '');
	const valuesSQL = (columns.length ? `VALUES (`+columns.map(c => `$[${c}]`).join(',')+`)` : 'DEFAULT VALUES');

	if (idColumn) {
		const sql = `INSERT INTO ${pgIdent(table)} ${columnsSQL} ${valuesSQL} RETURNING ${pgIdent(idColumn)}`;

		return (this || db).one(sql, values).then(row => row[idColumn]);
	} else {
		const sql = `INSERT INTO ${pgIdent(table)} ${columnsSQL} ${valuesSQL}`;

		return (this || db).none(sql, values).then(() => null);
	}
}

function update(table, idColumn, values, filter = null) {
	if (idColumn && (typeof idColumn == 'object')) {
		filter = values;
		values = idColumn;
		idColumn = table+'_id';
		if (values[idColumn] === undefined) {
			idColumn = null;
		}
	}

	values = {...values};
	filter = {...filter};

	const columns = Object.keys(values).filter(c => c !== idColumn);

	if (idColumn) {
		filter[idColumn] = values[idColumn];
	}

	let sql = `UPDATE ${pgIdent(table)} SET `+columns.map(c => `${pgIdent(c)} = $[${c}]`).join(",\n");

	const {filterValues, filterSQL} = buildFilter(filter);

	sql += ' WHERE '+filterSQL;

	return (this || db).none(sql, {...values, ...filterValues}).then(() => idColumn ? values[idColumn]: null);
}

function buildFilter(filter) {
	const values = {};

	const sql = Object.keys(filter).map(field => {
		if (filter[field] === null) {
			return `${pgIdent(field)} IS NULL`;
		} else {
			values[`_filter_`+field] = filter[field];

			if (Array.isArray(filter[field])) {
				return `${pgIdent(field)} = ANY($[_filter_${field}])`;
			} else {
				return `${pgIdent(field)} = $[_filter_${field}]`;
			}
		}
	}).join(' AND ');

	return {filterValues: values, filterSQL: sql};
}

function del(table, filter) {

	let sql = `DELETE FROM ${pgIdent(table)} WHERE `;

	const {filterValues, filterSQL} = buildFilter(filter);

	sql += filterSQL;

	return (this || db).none(sql, filterValues).then(() => null);
}

function selectOne(table, filter) {

	let sql = `SELECT * FROM ${pgIdent(table)}`;

	const {filterValues, filterSQL} = buildFilter(filter);
	if (filterSQL) {
		sql += ' WHERE ' + filterSQL;
	}

	return this.one(sql, filterValues);
}

function selectNone(table, filter) {

	let sql = `SELECT * FROM ${pgIdent(table)}`;

	const {filterValues, filterSQL} = buildFilter(filter);
	if (filterSQL) {
		sql += ' WHERE ' + filterSQL;
	}

	return this.none(sql, filterValues);
}

function selectMany(table, filter, order = null) {

	let sql = `SELECT * FROM ${pgIdent(table)}`;

	const {filterValues, filterSQL} = buildFilter(filter);
	if (filterSQL) {
		sql += ' WHERE ' + filterSQL;
	}

	if (order) {
		sql += ' ORDER BY '+order.join(', ');
	}

	return (this || db).many(sql, filterValues);
}

function selectAny(table, filter, order = null) {

	let sql = `SELECT * FROM ${pgIdent(table)}`;

	const {filterValues, filterSQL} = buildFilter(filter);
	if (filterSQL) {
		sql += ' WHERE ' + filterSQL;
	}

	if (order) {
		sql += ' ORDER BY '+order.join(', ');
	}

	return (this || db).any(sql, filterValues);
}

function selectOneOrNone(table, filter) {

	let sql = `SELECT * FROM ${pgIdent(table)}`;

	const {filterValues, filterSQL} = buildFilter(filter);
	if (filterSQL) {
		sql += ' WHERE ' + filterSQL;
	}

	return (this || db).oneOrNone(sql, filterValues);
}

function save(table, idColumn, values) {
	if (idColumn && (typeof idColumn == 'object')) {
		values = idColumn;
		idColumn = table+'_id';
	}

	if (idColumn && values[idColumn]) {
		return update.call(this, table, idColumn, values);
	} else {
		let insertValues = {...values};
		idColumn && delete insertValues[idColumn];
		return insert.call(this, table, idColumn, insertValues);
	}
}

function first(sql, values = {}) {
	return (this || db).oneOrNone(sql, values).then(row => row ? row[Object.keys(row)[0]] : null);
}
