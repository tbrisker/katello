import { propsToSnakeCase } from 'foremanReact/common/helpers';

import { isEmpty } from 'lodash';
import api, { orgId } from '../../services/api';

import {
  SUBSCRIPTIONS,
  SUBSCRIPTIONS_REQUEST,
  SUBSCRIPTIONS_SUCCESS,
  SUBSCRIPTIONS_FAILURE,
  SUBSCRIPTIONS_QUANTITIES_REQUEST,
  SUBSCRIPTIONS_QUANTITIES_SUCCESS,
  SUBSCRIPTIONS_QUANTITIES_FAILURE,
  UPDATE_QUANTITY_REQUEST,
  UPDATE_QUANTITY_SUCCESS,
  UPDATE_QUANTITY_FAILURE,
  UPDATE_SUBSCRIPTION_COLUMNS,
  DELETE_SUBSCRIPTIONS_REQUEST,
  DELETE_SUBSCRIPTIONS_SUCCESS,
  DELETE_SUBSCRIPTIONS_FAILURE,
  SUBSCRIPTION_TABLE_COLUMNS,
  SUBSCRIPTION_TABLE_DEFAULT_COLUMNS,
  SUBSCRIPTIONS_COLUMNS_REQUEST,
  SUBSCRIPTIONS_UPDATE_SEARCH_QUERY,
  SUBSCRIPTIONS_OPEN_DELETE_MODAL,
  SUBSCRIPTIONS_CLOSE_DELETE_MODAL,
  SUBSCRIPTIONS_DISABLE_DELETE_BUTTON,
  SUBSCRIPTIONS_ENABLE_DELETE_BUTTON,
  BLOCKING_FOREMAN_TASK_TYPES,
  SUBSCRIPTIONS_RESET_TASKS,
  MANIFEST_DELETE_TASK_LABEL,
} from './SubscriptionConstants';
import { selectSubscriptionsQuantitiesFromResponse } from './SubscriptionHelpers.js';
import { apiError } from '../../utils/helpers.js';
import {
  startPollingTask,
  stopPollingTask,
  startPollingTasks,
  stopPollingTasks,
  toastTaskFinished,
} from '../Tasks/TaskActions';
import { selectIsPollingTasks } from '../Tasks/TaskSelectors';
import { pingUpstreamSubscriptions } from './UpstreamSubscriptions/UpstreamSubscriptionsActions';

export const createSubscriptionParams = (extendedParams = {}) => ({
  ...{
    organization_id: orgId(),
    include_permissions: true,
  },
  ...propsToSnakeCase(extendedParams),
});

export const loadAvailableQuantities = (extendedParams = {}) => async (dispatch) => {
  dispatch({ type: SUBSCRIPTIONS_QUANTITIES_REQUEST });

  try {
    const { data } = await api.get(`/organizations/${orgId()}/upstream_subscriptions`, {}, propsToSnakeCase(extendedParams));
    return dispatch({
      type: SUBSCRIPTIONS_QUANTITIES_SUCCESS,
      payload: selectSubscriptionsQuantitiesFromResponse(data),
    });
  } catch (error) {
    return dispatch(apiError(SUBSCRIPTIONS_QUANTITIES_FAILURE, error));
  }
};

export const loadSubscriptions = (extendedParams = {}) => async (dispatch) => {
  dispatch({ type: SUBSCRIPTIONS_REQUEST });

  const params = createSubscriptionParams(extendedParams);

  try {
    const { data } = await api.get('/subscriptions', {}, params);
    const result = dispatch({
      type: SUBSCRIPTIONS_SUCCESS,
      response: data,
      search: extendedParams.search,
    });
    return result;
  } catch (error) {
    return dispatch(apiError(SUBSCRIPTIONS_FAILURE, error));
  }
};

export const cancelPollTasks = () => (dispatch, getState) => {
  if (selectIsPollingTasks(getState(), SUBSCRIPTIONS)) {
    dispatch(stopPollingTasks(SUBSCRIPTIONS));
  }
};

export const pollTasks = () => dispatch => dispatch(startPollingTasks(SUBSCRIPTIONS, {
  organization_id: orgId(),
  result: 'pending',
  label: BLOCKING_FOREMAN_TASK_TYPES.join(' or '),
}));

export const resetTasks = () => (dispatch) => {
  dispatch({
    type: SUBSCRIPTIONS_RESET_TASKS,
  });
};

export const handleFinishedTask = task => (dispatch) => {
  dispatch(stopPollingTask(SUBSCRIPTIONS));
  dispatch(toastTaskFinished(task));
  dispatch(resetTasks());
  dispatch(pollTasks());
  dispatch(loadSubscriptions());

  if (task.label !== MANIFEST_DELETE_TASK_LABEL) {
    dispatch(pingUpstreamSubscriptions());
  }
};

export const handleStartTask = task => (dispatch) => {
  dispatch(cancelPollTasks());
  dispatch(startPollingTask(SUBSCRIPTIONS, task));
};

export const updateQuantity = (quantities = {}) => async (dispatch) => {
  dispatch({ type: UPDATE_QUANTITY_REQUEST });

  const params = {
    pools: quantities,
  };

  try {
    const { data } = await api.put(`/organizations/${orgId()}/upstream_subscriptions`, params);
    return dispatch({
      type: UPDATE_QUANTITY_SUCCESS,
      response: data,
    });
  } catch (error) {
    return dispatch(apiError(UPDATE_QUANTITY_FAILURE, error));
  }
};

export const loadTableColumns = selectedColumns => (dispatch) => {
  const enabledColumns = (isEmpty(selectedColumns) ?
    SUBSCRIPTION_TABLE_DEFAULT_COLUMNS : selectedColumns.columns);
  dispatch({
    type: UPDATE_SUBSCRIPTION_COLUMNS,
    payload: { enabledColumns },
  });

  const tableColumns = SUBSCRIPTION_TABLE_COLUMNS.map((option) => {
    const currentOption = option;
    currentOption.value = enabledColumns.includes(option.key);

    return currentOption;
  });

  dispatch({
    type: SUBSCRIPTIONS_COLUMNS_REQUEST,
    payload: { tableColumns },
  });
};

export const deleteSubscriptions = poolIds => async (dispatch) => {
  dispatch({ type: DELETE_SUBSCRIPTIONS_REQUEST });

  const params = {
    pool_ids: poolIds,
  };

  try {
    const { data } = await api.delete(`/organizations/${(orgId())}/upstream_subscriptions`, {}, params);
    return dispatch({
      type: DELETE_SUBSCRIPTIONS_SUCCESS,
      response: data,
    });
  } catch (error) {
    return dispatch(apiError(DELETE_SUBSCRIPTIONS_FAILURE, error));
  }
};

export const updateSearchQuery = query => ({
  type: SUBSCRIPTIONS_UPDATE_SEARCH_QUERY,
  payload: query,
});

export const openDeleteModal = () => ({ type: SUBSCRIPTIONS_OPEN_DELETE_MODAL });
export const closeDeleteModal = () => ({ type: SUBSCRIPTIONS_CLOSE_DELETE_MODAL });

export const disableDeleteButton = () => ({ type: SUBSCRIPTIONS_DISABLE_DELETE_BUTTON });
export const enableDeleteButton = () => ({ type: SUBSCRIPTIONS_ENABLE_DELETE_BUTTON });

export default loadSubscriptions;
