import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import {
	GithubParams,
	Reclaim,
	generateUuid,
} from '@reclaimprotocol/reclaim-sdk'
import { Pool } from 'pg'
import cors from 'cors'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8000
const callbackUrl = process.env.CALLBACK_URL! + '/' + 'callback/'

app.use(express.json())
app.use(cors())

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
})

const reclaim = new Reclaim()

const isValidRepo = (repoStr: string) => {
	return repoStr.indexOf('/') > -1 && repoStr.split('/').length === 2
}

app.get('/home/repo', async (req: Request, res: Response) => {
	let { repo, email, claimTypes } = req.query
	if (!repo || !email || !claimTypes || !claimTypes.length) {
		res
			.status(400)
			.send(`400 - Bad Request: repo, email and claimTypes are required`)
		return
	}
	const repoFullName = repo as string
	const emailStr = email as string

	if (!isValidRepo(repoFullName)) {
		res.status(400).send(`400 - Bad Request: invalid repository name`)
		return
	}

	claimTypes = JSON.parse(claimTypes as string) as Array<GithubParams['type']>

	const callbackId = 'repo-' + generateUuid()
	const template = (
		await reclaim.connect(
			'github-claim',
			claimTypes.map((item) => ({
				provider: 'github-claim',
				payload: {
					searchQuery: {
						keywords: [],
						qualifiers: {},
					},
					repository: repoFullName,
					type: item as GithubParams['type'],
				},
				templateClaimId: generateUuid(),
			})),
			callbackUrl
		)
	).generateTemplate(callbackId)
	const url = template.url
	const templateId = template.id

	try {
		await pool.query(
			'INSERT INTO submitted_links (callback_id, status, repo, email, template_id, claimTypes) VALUES ($1, $2, $3, $4, $5, $6)',
			[
				callbackId,
				'pending',
				repoFullName,
				emailStr,
				templateId,
				JSON.stringify(claimTypes),
			]
		)
	} catch (e) {
		res.status(400).send(`500 - Internal Server Error - ${e}`)
		return
	}

	res.json({ url, callbackId })
})

app.get('/status/:callbackId', async (req: Request, res: Response) => {
	let statuses

	if (!req.params.callbackId) {
		res.status(400).send(`400 - Bad Request: callbackId is required`)
		return
	}

	const callbackId = req.params.callbackId

	try {
		const results = await pool.query(
			'SELECT callback_id FROM submitted_links WHERE callback_id = $1',
			[callbackId]
		)
		if (results.rows.length === 0) {
			res.status(404).send(`404 - Not Found: callbackId not found`)
			return
		}
	} catch (e) {
		res.status(500).send(`500 - Internal Server Error - ${e}`)
		return
	}

	try {
		statuses = await pool.query(
			'SELECT status FROM submitted_links WHERE callback_id = $1',
			[callbackId]
		)
	} catch (e) {
		res.status(500).send(`500 - Internal Server Error - ${e}`)
		return
	}

	res.json({ status: statuses?.rows[0]?.status })
})

app.use(express.text({ type: '*/*' }))

app.post('/callback/:id', async (req: Request, res: Response) => {
	if (!req.params.id) {
		res.status(400).send(`400 - Bad Request: callbackId is required`)
		return
	}

	if (!req.body) {
		res.status(400).send(`400 - Bad Request: body is required`)
		return
	}

	const reqBody = JSON.parse(decodeURIComponent(req.body))

	if (!reqBody.claims || !reqBody.claims.length) {
		res.status(400).send(`400 - Bad Request: claims are required`)
		return
	}

	const callbackId = req.params.id

	const claims = { claims: reqBody.claims }

	try {
		const results = await pool.query(
			'SELECT * FROM submitted_links WHERE callback_id = $1',
			[callbackId]
		)

		if (results.rows.length === 0) {
			res.status(404).send(`404 - Not Found: callbackId not found`)
			return
		}
	} catch (e) {
		res.status(500).send(`500 - Internal Server Error - ${e}`)
		return
	}

	try {
		await pool.query(
			'UPDATE submitted_links SET claims = $1, status = $2 WHERE callback_id = $3;',
			[JSON.stringify(claims), 'verified', callbackId]
		)
	} catch (e) {
		res.status(500).send(`500 - Internal Server Error - ${e}`)
		return
	}

	res.send(`<div
	style="
	  width: 100%;
	  height: 100%;
	  display: flex;
	  text-align: center;
	  justify-content: center;
	  align-items: center;
	"
  >
	<h1>
	  Verified contribution to the repository for the lens handle
	</h1>
  </div>`)
})

process.on('uncaughtException', function (err) {
	console.log('Caught exception: ', err)
})

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`)
})
