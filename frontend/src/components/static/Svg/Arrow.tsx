const Arrow: React.FC<JSX.IntrinsicElements['div']> = (props) => {
	return (
		<div {...props}>
			<svg
				width="63"
				height="62"
				viewBox="0 0 63 62"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M34 25.1875V6.91422C34 3.79605 30.23 2.23446 28.0251 4.43934L3.93934 28.5251L5.69273 30.2785L3.93934 28.5251C2.57251 29.892 2.57251 32.108 3.93934 33.4749L5.70711 31.7071L3.93934 33.4749L28.0251 57.5607C30.23 59.7655 34 58.204 34 55.0858V36.8125H57C58.933 36.8125 60.5 35.2455 60.5 33.3125V28.6875C60.5 26.7545 58.933 25.1875 57 25.1875H34Z"
					fill="#FFE400"
					stroke="#FFE400"
					stroke-width="5"
				/>
			</svg>
		</div>
	)
}
export default Arrow
