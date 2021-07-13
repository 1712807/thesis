import { createSelector } from 'reselect';

const appSelector = (state) => state.app;

export const detailPageParamsSelector = createSelector(
    appSelector,
    (app) => app.detailPageParams
)

export const isLoadingPageSelector = createSelector(
    appSelector,
    (app) => app.isLoadingPage
)

export const isEmptyPageSelector = createSelector(
    appSelector,
    (app) => app.isEmptyPage
)

export const flagNotiSelector = createSelector(
    appSelector,
    (app) => app.flagNoti
)