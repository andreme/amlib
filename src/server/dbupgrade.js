import fs from 'fs';
import path from 'path';
import {toInt} from '../utils';

function getFilesFromDir(dir, files) {
	if (!fs.existsSync(dir)) {
		return;
	}

	fs.readdirSync(dir)
		.forEach(file => {
			const filename = path.join(dir, file);
			if (fs.lstatSync(filename).isFile()) {
				const id = toInt(file.match(/^\d+/)[0]);
				if (files[id]) {
					throw new Error('Duplicate Upgrade - ID: '+id);
				}
				files[id] = filename;
			}
		});
}

function getExecutedUpgrades(db) {
	return db.any(`SELECT id FROM upgrades`)
		.then(rows => {
			let result = {};
			rows.forEach(r => {
				result[r.id] = true;
			});

			return result;
		});
}

export async function upgradeDB(db, directories) {

	const executedUpgrades = await getExecutedUpgrades(db);

	console.log('DB Upgrades...');

	const files = {};

	directories.map(dir => getFilesFromDir(dir, files));

	let upgrades = Object.keys(files).map(toInt).filter(id => !executedUpgrades[id]);
	upgrades.sort((a, b) => a -b);

	for (const id of upgrades) {
		console.log('Executing ', path.basename(files[id]));

		await db.tx(async tx => {
			await tx.any(`$[sql:raw]`, {sql: fs.readFileSync(files[id], 'ascii')});

			await tx.none(`INSERT INTO upgrades (id) VALUES ($[id])`, {
				id,
			});

			console.log('Executed ', path.basename(files[id]));
		});
	}

	console.log('DB Upgrades done');
}
