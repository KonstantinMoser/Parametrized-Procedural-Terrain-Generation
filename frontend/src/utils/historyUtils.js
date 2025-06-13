// Utility function to format a parameter for display
const formatParameter = (value) => {
	if (typeof value === "object" && value !== null) {
		return Object.entries(value)
			.map(([key, val]) => `${key}: ${val}`)
			.join(", ");
	}
	return String(value);
}

// Utility function to render the parameters
export function renderParameters(
	parameters,
	handleShowMore,
	showMoreParams,
	identifier
) {
	return (
		<>
			{Object.entries(parameters)
				.slice(0, showMoreParams[identifier] ? undefined : 2)
				.map(([key, value]) => (
					<div key={key} className="parameter-item">
						<span className="parameter-key">{key}: </span>
						<span className="parameter-value">{formatParameter(value)}</span>
					</div>
				))}
			{Object.keys(parameters).length > 2 && (
				<button
					className="show-more"
					onClick={(e) => {
						e.stopPropagation();
						handleShowMore(identifier);
					}}>
					{showMoreParams[identifier] ? "Show Less" : "Show More"}
				</button>
			)}
		</>
	);
}

