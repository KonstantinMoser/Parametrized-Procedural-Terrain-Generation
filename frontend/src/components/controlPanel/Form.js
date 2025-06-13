//Form.js
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FormikProvider } from "formik";
import ParameterSection from './ParameterSection';
import { renderAlgorithmOptions } from '../../utils/formUtils';
import { useControlPanelForm } from "../../hooks/useControlPanelForm";
import { useAlgorithmSelection } from "../../hooks/useAlgorithmSelection";
import { FaInfoCircle } from "react-icons/fa";
import { HelpPopup } from "./HelpPopup";
import "./Form.css";


export const Form = (id) => {
	const { algorithms } = useAlgorithmSelection();
	const [erosionParameters] = useSelector((state) => [
		state.erosion.parameters, state.panels.isControlPanelOpen,
	]);
	const [applyErosion, setApplyErosion] = useState(false);
	const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
	const handleAlgorithmChange = (e) => {
		setSelectedAlgorithm(e.target.value || "");
		formik.setFieldValue("selectedAlgorithm",
			e.target.value || "");
	};

	const handleErosionCheckboxChange = () => {
		setApplyErosion(!applyErosion);
		formik.setFieldValue("applyErosion", !applyErosion);
	};

	const [showHelpPopup, setShowHelpPopup] = useState(false);
	const handleHelpPopup = () => {
		setShowHelpPopup(!showHelpPopup);
	}

	const [showHelpPopupErosion, setShowHelpPopupErosion] = useState(false);
	const handleHelpPopupErosion = () => {
		setShowHelpPopupErosion(!showHelpPopupErosion);
	}

	const formik = useControlPanelForm(selectedAlgorithm, algorithms, erosionParameters, applyErosion, id);


	return (
		<FormikProvider value={formik}>
			{showHelpPopup && (
				< HelpPopup
					description={algorithms[selectedAlgorithm].description}
					parameters={algorithms[selectedAlgorithm].parameters}
					onClose={handleHelpPopup}
					id="algorithm"
				/>


			)}
			{showHelpPopupErosion && (
				< HelpPopup
					description={erosionParameters.description}
					parameters={erosionParameters.parameters}
					onClose={handleHelpPopupErosion}
					id="erosion"
				/>
			)}
			<div className="columns-container">
				<form className="column" onSubmit={formik.handleSubmit}>
					<h2 className="panel-title">Terrain Generator</h2>
					<div className="select-info-wrapper">
						<select
							id="algorithmSelect"
							value={selectedAlgorithm}
							onChange={handleAlgorithmChange}
							className="select">
							<option value="">Select an algorithm...</option>
							{renderAlgorithmOptions(algorithms)}
						</select>
						{selectedAlgorithm && (
							<div className="info-icon" onClick={handleHelpPopup}>
								<FaInfoCircle title="Help" />
							</div>
						)}
					</div>

					{selectedAlgorithm && (
						<>
							<ParameterSection
								title="Algorithm Parameters"
								parameters={algorithms[selectedAlgorithm]?.parameters || []}
								formik={formik}
							/>

							<div className="apply-erosion">
								<label className="switch-container ">
									Apply Erosion
									<input
										type="checkbox"
										id="applyErosion"
										checked={applyErosion}
										onChange={handleErosionCheckboxChange}
									/>

									<span className="slider"></span>

								</label>

								<div className="info-icon" onClick={handleHelpPopupErosion}>
									<FaInfoCircle title="Help" />
								</div>

							</div>


							{selectedAlgorithm && applyErosion && (

								<ParameterSection
									title="Erosion Parameters"
									parameters={erosionParameters.parameters || []}
									formik={formik}
								/>
							)}


							<div className="button-wrapper">
								<button type="submit" className="generate-button">
									Generate
								</button>
							</div>
						</>
					)}
				</form>

			</div>

		</FormikProvider>
	);
};


