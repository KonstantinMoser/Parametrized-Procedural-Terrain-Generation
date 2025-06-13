// src/hooks/useAlgorithmSelection.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAlgorithms } from "../store/reducers/algorithmsReducer";

export const useAlgorithmSelection = () => {
  const dispatch = useDispatch();
  const algorithms = useSelector((state) => state.algorithms.entities);

  useEffect(() => {
    if (algorithms.length === 0) {
      dispatch(fetchAlgorithms());
    }
  }, [dispatch, algorithms.length]);

  return { algorithms };
};
