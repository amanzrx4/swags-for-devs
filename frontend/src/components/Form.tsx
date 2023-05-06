import { useState } from 'react'
import toast from 'react-hot-toast'
import { extractGitHubRepoPath, handleError } from '../utils'
import { startCase } from 'lodash'

export type Inputs = {
	email: string
	repoLink: string
	claimTypes: GithubClaimType[]
}

type FormProps = {
	proveIt: (input: Inputs) => Promise<void>
}

const CLAIM_TYPE = ['issues', 'commits', 'pullRequests'] as const

type GithubClaimType = (typeof CLAIM_TYPE)[number]

const Form = ({ proveIt }: FormProps) => {
	const [input, setInput] = useState<Omit<Inputs, 'claimTypes'>>({
		email: '',
		repoLink: '',
	})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInput((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}))
	}

	const [selectedButton, setSelectedButton] = useState<GithubClaimType[]>([
		'commits',
	])

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const repoFullName = extractGitHubRepoPath(input.repoLink)
		if (!repoFullName) return toast.error('Invalid repository link')
		proveIt({ ...input, claimTypes: selectedButton }).catch((e) =>
			console.log(handleError(e))
		)
	}
	return (
		<form
			onSubmit={onSubmit}
			className="flex flex-col items-center w-full gap-5 lg:items-start text-offBlack"
		>
			<input
				type="email"
				name="email"
				required
				onChange={handleChange}
				value={input.email}
				placeholder="Your student email id"
				className="w-full px-5 py-5 lg:py-3 bg-white text-offBlack rounded-xl"
			/>
			<input
				name="repoLink"
				required
				onChange={handleChange}
				value={input.repoLink}
				placeholder="GitHub repo link"
				className="w-full px-5 py-5 lg:py-3 bg-white text-offBlack rounded-xl"
			/>
			<div className="w-full text-left mt-2">
				<label className="text-white uppercase my-4 font-sans font-bold">
					Claim type (Multiple)
				</label>
				<div className="items-center flex justify-between w-full mt-2">
					{CLAIM_TYPE.map((claim) => {
						const classes = selectedButton.includes(claim) ? `bg-yellow` : `bg-white`
						return (
							<button
								key={claim}
								type="button"
								onClick={() => {
									if (selectedButton.includes(claim)) {
										return setSelectedButton((prev) =>
											prev.filter((btn) => btn !== claim)
										)
									}
									setSelectedButton((prev) => [...prev, claim])
								}}
								className={`py-3 lg:py-3 mt-2 px-4 rounded-md ease-in transition-colors ${classes}`}
							>
								{startCase(claim)}
							</button>
						)
					})}
				</div>
			</div>

			<button
				type="submit"
				className="py-5 lg:py-4 mt-5 transition-colors ease-in bg-yellow px-9 rounded-xl hover:shadow-lg"
			>
				Claim your swag!
			</button>
		</form>
	)
}

export default Form
