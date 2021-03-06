import { propsToSnakeCase } from 'foremanReact/common/helpers';

import api, { orgId } from '../../../services/api';
import { apiError } from '../../../utils/helpers.js';

import {
  UPLOAD_MANIFEST_REQUEST,
  UPLOAD_MANIFEST_SUCCESS,
  UPLOAD_MANIFEST_FAILURE,
  REFRESH_MANIFEST_REQUEST,
  REFRESH_MANIFEST_SUCCESS,
  REFRESH_MANIFEST_FAILURE,
  DELETE_MANIFEST_REQUEST,
  DELETE_MANIFEST_SUCCESS,
  DELETE_MANIFEST_FAILURE,
  MANIFEST_HISTORY_REQUEST,
  MANIFEST_HISTORY_SUCCESS,
  MANIFEST_HISTORY_FAILURE,
  ENABLE_SIMPLE_CONTENT_ACCESS_REQUEST,
  ENABLE_SIMPLE_CONTENT_ACCESS_SUCCESS,
  ENABLE_SIMPLE_CONTENT_ACCESS_FAILURE,
  DISABLE_SIMPLE_CONTENT_ACCESS_REQUEST,
  DISABLE_SIMPLE_CONTENT_ACCESS_SUCCESS,
  DISABLE_SIMPLE_CONTENT_ACCESS_FAILURE,
  SIMPLE_CONTENT_ACCESS_ELIGIBLE_REQUEST,
  SIMPLE_CONTENT_ACCESS_ELIGIBLE_SUCCESS,
  SIMPLE_CONTENT_ACCESS_ELIGIBLE_FAILURE,
} from './ManifestConstants';

export const uploadManifest = file => async (dispatch) => {
  dispatch({ type: UPLOAD_MANIFEST_REQUEST });

  const formData = new FormData();
  formData.append('content', file);

  const config = {
    'Content-Type': 'multipart/form-data',
  };

  try {
    const { data } = await api.post(`/organizations/${orgId()}/subscriptions/upload`, formData, config);
    return dispatch({
      type: UPLOAD_MANIFEST_SUCCESS,
      response: data,
    });
  } catch (error) {
    return dispatch(apiError(UPLOAD_MANIFEST_FAILURE, error));
  }
};

export const refreshManifest = (extendedParams = {}) => async (dispatch) => {
  dispatch({ type: REFRESH_MANIFEST_REQUEST });

  const params = {
    ...propsToSnakeCase(extendedParams),
  };

  try {
    const { data } = await api.put(`/organizations/${orgId()}/subscriptions/refresh_manifest`, {}, params);
    return dispatch({
      type: REFRESH_MANIFEST_SUCCESS,
      response: data,
    });
  } catch (error) {
    return dispatch(apiError(REFRESH_MANIFEST_FAILURE, error));
  }
};

export const deleteManifest = (extendedParams = {}) => async (dispatch) => {
  dispatch({ type: DELETE_MANIFEST_REQUEST });

  const params = {
    ...propsToSnakeCase(extendedParams),
  };

  try {
    const { data } = await api.post(`/organizations/${orgId()}/subscriptions/delete_manifest`, {}, params);
    return dispatch({
      type: DELETE_MANIFEST_SUCCESS,
      response: data,
    });
  } catch (error) {
    return dispatch(apiError(DELETE_MANIFEST_FAILURE, error));
  }
};

export const checkSimpleContentAccessEligible = () => async (dispatch) => {
  dispatch({ type: SIMPLE_CONTENT_ACCESS_ELIGIBLE_REQUEST });

  try {
    const { data } = await api.get(`/organizations/${orgId()}/upstream_subscriptions/simple_content_access/eligible`, {});
    return dispatch({
      type: SIMPLE_CONTENT_ACCESS_ELIGIBLE_SUCCESS,
      response: data,
    });
  } catch (error) {
    return dispatch(apiError(SIMPLE_CONTENT_ACCESS_ELIGIBLE_FAILURE, error));
  }
};

export const enableSimpleContentAccess = (extendedParams = {}) => async (dispatch) => {
  dispatch({ type: ENABLE_SIMPLE_CONTENT_ACCESS_REQUEST });

  const params = {
    ...propsToSnakeCase(extendedParams),
  };

  try {
    const { data } = await api.put(`/organizations/${orgId()}/upstream_subscriptions/simple_content_access/enable`, {}, params);
    return dispatch({
      type: ENABLE_SIMPLE_CONTENT_ACCESS_SUCCESS,
      response: data,
    });
  } catch (error) {
    return dispatch(apiError(ENABLE_SIMPLE_CONTENT_ACCESS_FAILURE, error));
  }
};

export const disableSimpleContentAccess = (extendedParams = {}) => async (dispatch) => {
  dispatch({ type: DISABLE_SIMPLE_CONTENT_ACCESS_REQUEST });

  const params = {
    ...propsToSnakeCase(extendedParams),
  };

  try {
    const { data } = await api.put(`/organizations/${orgId()}/upstream_subscriptions/simple_content_access/disable`, {}, params);
    return dispatch({
      type: DISABLE_SIMPLE_CONTENT_ACCESS_SUCCESS,
      response: data,
    });
  } catch (error) {
    return dispatch(apiError(DISABLE_SIMPLE_CONTENT_ACCESS_FAILURE, error));
  }
};

export const loadManifestHistory = (extendedParams = {}) => async (dispatch) => {
  dispatch({ type: MANIFEST_HISTORY_REQUEST });

  const params = {
    ...propsToSnakeCase(extendedParams),
  };

  try {
    const { data } = await api.get(`/organizations/${orgId()}/subscriptions/manifest_history`, {}, params);
    return dispatch({
      type: MANIFEST_HISTORY_SUCCESS,
      response: data,
    });
  } catch (error) {
    return dispatch(apiError(MANIFEST_HISTORY_FAILURE, error));
  }
};

export default loadManifestHistory;
