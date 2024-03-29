import type { RetailerWarehouseStateType } from '../interface';
import * as constants from './constant';

export const initialState: RetailerWarehouseStateType = {
  dataRetailerWarehouse: {
    count: 0,
    next: '',
    previous: '',
    results: []
  },
  isLoading: false,
  isLoadingDeleteBulk: false,
  error: '',
  dataRetailerWarehouseDetail: {
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    description: '',
    id: '',
    name: '',
    retailer: {
      created_at: '',
      id: '',
      name: '',
      organization: '',
      type: '',
      updated_at: ''
    },
    created_at: '',
    updated_at: ''
  }
};

function RetailerWarehouseReducer(
  state: RetailerWarehouseStateType,
  action: {
    type: string;
    payload: any;
  }
) {
  switch (action.type) {
    case constants.GET_RETAILER_WAREHOUSE_REQUEST: {
      return {
        ...state,
        isLoading: true
      };
    }
    case constants.GET_RETAILER_WAREHOUSE_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        dataRetailerWarehouse: action.payload
      };
    }
    case constants.GET_RETAILER_WAREHOUSE_FAIL: {
      return {
        ...state,
        isLoading: false
      };
    }

    case constants.GET_RETAILER_WAREHOUSE_DETAIL_REQUEST: {
      return {
        ...state,
        isLoading: true
      };
    }
    case constants.GET_RETAILER_WAREHOUSE_DETAIL_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        dataRetailerWarehouseDetail: action.payload
      };
    }
    case constants.GET_RETAILER_WAREHOUSE_DETAIL_FAIL: {
      return {
        ...state,
        isLoading: false
      };
    }

    case constants.CREATE_RETAILER_WAREHOUSE_REQUEST: {
      return {
        ...state,
        isLoading: true,
        error: ''
      };
    }
    case constants.CREATE_RETAILER_WAREHOUSE_SUCCESS: {
      return {
        ...state,
        isLoading: false
      };
    }
    case constants.CREATE_RETAILER_WAREHOUSE_FAIL: {
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    }

    case constants.UPDATE_RETAILER_WAREHOUSE_REQUEST: {
      return {
        ...state,
        isLoading: true,
        error: ''
      };
    }
    case constants.UPDATE_RETAILER_WAREHOUSE_SUCCESS: {
      return {
        ...state,
        isLoading: false
      };
    }
    case constants.UPDATE_RETAILER_WAREHOUSE_FAIL: {
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    }

    case constants.DELETE_RETAILER_WAREHOUSE_REQUEST: {
      return {
        ...state,
        isLoading: true
      };
    }
    case constants.DELETE_RETAILER_WAREHOUSE_SUCCESS: {
      return {
        ...state,
        isLoading: false
      };
    }
    case constants.DELETE_RETAILER_WAREHOUSE_FAIL: {
      return {
        ...state,
        isLoading: false
      };
    }

    case constants.DELETE_BULK_WAREHOUSE_REQUEST: {
      return {
        ...state,
        isLoadingDeleteBulk: true
      };
    }
    case constants.DELETE_BULK_WAREHOUSE_SUCCESS:
    case constants.DELETE_BULK_WAREHOUSE_FAIL: {
      return {
        ...state,
        isLoadingDeleteBulk: false
      };
    }

    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

export default RetailerWarehouseReducer;
