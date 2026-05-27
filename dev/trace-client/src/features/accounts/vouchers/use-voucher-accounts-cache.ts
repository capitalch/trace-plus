import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SqlIdsMap } from '../../../app/maps/sql-ids-map';
import { AppDispatchType } from '../../../app/store';
import { AccountOptionType } from '../../../controls/redux-components/account-picker-flat/account-picker-flat';
import { Utils } from '../../../utils/utils';
import { useUtilsInfo } from '../../../utils/utils-info-hook';
import {
    AccountsCacheKeyType,
    setAccountsCache,
    updateAccountsCacheKey,
} from './voucher-slice';

const CACHE_CLASS_MAP: Record<AccountsCacheKeyType, string[]> = {
    cashBankAccounts: ['cash', 'bank', 'ecash', 'card'],
    paymentDebitAccounts: ['debtor', 'creditor', 'dexp', 'iexp', 'other', 'purchase', 'loan', 'capital'],
    receiptCreditAccounts: ['debtor', 'creditor', 'other', 'dexp', 'iexp', 'loan', 'capital', 'iincome', 'dincome'],
    journalAccounts: ['branch', 'capital', 'other', 'loan', 'iexp', 'dexp', 'dincome', 'iincome', 'creditor', 'debtor', 'sale', 'purchase'],
}

export function useVoucherAccountsCache() {
    const dispatch = useDispatch<AppDispatchType>();
    const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();

    const loadAllAccountsCache = useCallback(async () => {
        try {
            const keys: AccountsCacheKeyType[] = [
                'cashBankAccounts', 'paymentDebitAccounts',
                'receiptCreditAccounts', 'journalAccounts',
            ]
            const results = await Promise.allSettled(
                keys.map(key => Utils.doGenericQuery({
                    buCode: buCode || '',
                    dbName: dbName || '',
                    dbParams: decodedDbParamsObject || {},
                    sqlId: SqlIdsMap.getLeafSubledgerAccountsOnClass,
                    sqlArgs: { accClassNames: CACHE_CLASS_MAP[key].join(',') },
                }))
            )
            const [cashBank, paymentDebit, receiptCredit, journal] = results.map(r =>
                r.status === 'fulfilled' ? (r.value || []) : []
            )
            dispatch(setAccountsCache({
                cashBankAccounts: cashBank,
                paymentDebitAccounts: paymentDebit,
                receiptCreditAccounts: receiptCredit,
                journalAccounts: journal,
                isLoaded: true,
            }))
        } catch (error) {
            console.error('Failed to load voucher accounts cache:', error)
        }
    }, [buCode, dbName, decodedDbParamsObject, dispatch])

    const refreshCacheKey = useCallback(async (key: AccountsCacheKeyType) => {
        try {
            const data: AccountOptionType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject || {},
                sqlId: SqlIdsMap.getLeafSubledgerAccountsOnClass,
                sqlArgs: { accClassNames: CACHE_CLASS_MAP[key].join(',') },
            })
            dispatch(updateAccountsCacheKey({ key, data: data || [] }))
        } catch (error) {
            console.error(`Failed to refresh voucher accounts cache key "${key}":`, error)
        }
    }, [buCode, dbName, decodedDbParamsObject, dispatch])

    return { loadAllAccountsCache, refreshCacheKey }
}
