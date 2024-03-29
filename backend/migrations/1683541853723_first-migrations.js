/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.createTable('submitted_links', {
		id: 'id',
		callback_id: { type: 'varchar(1000)', notNull: true },
		claims: { type: 'TEXT', notNull: false },
		status: { type: 'varchar(20)', notNull: true },
		email: { type: 'varchar(1000)', notNull: true },
		template_id: { type: 'varchar(1000)', notNull: false },
		repo: { type: 'varchar(1000)', notNull: false },
		claimTypes: { type: 'varchar(200)', notNull: true },
	})
}

exports.down = (pgm) => {}
