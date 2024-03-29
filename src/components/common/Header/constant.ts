import Admin from 'public/Admin.svg';
import Dashboard from 'public/Dashboard.svg';
import Marketplace from 'public/Marketplace.svg';
import PO from 'public/PO.svg';
import Product from 'public/Product.svg';
import Settings from 'public/Settings.svg';
import UserManager from 'public/UserManager.svg';

export type Submenu = {
  name: string;
  path: string;
  Icon: React.ElementType;
};
export interface Menu {
  name: string;
  Icon: React.ElementType;
  path: string;
  listPath?: string[];
  subMenu?: Submenu[];
}

export const headerData: Menu[] = [
  {
    name: 'Product',
    Icon: PO,
    path: '/product',
    listPath: ['/products', '/product-series'],
    subMenu: [
      {
        name: 'Products',
        path: '/products',
        Icon: PO
      },
      {
        name: 'Product series',
        path: '/product-series',
        Icon: PO
      }
    ]
  },
  {
    name: 'Retailers',
    Icon: PO,
    path: '/',
    listPath: ['/product-aliases', '/inventory', '/retailers'],
    subMenu: [
      {
        name: 'Product Alias',
        path: '/product-aliases',
        Icon: PO
      },
      {
        name: 'Retailer Inventory',
        path: '/inventory',
        Icon: PO
      },
      {
        name: 'Retailers',
        path: '/retailers',
        Icon: PO
      }
    ]
  },
  {
    name: 'Shipment',
    Icon: PO,
    path: '/shipment',
    listPath: ['/shipments/returns'],
    subMenu: [
      {
        name: 'Returns',
        path: '/shipments/returns',
        Icon: PO
      }
    ]
  },
  {
    name: 'Warehouse',
    listPath: ['/warehouse'],
    path: '/warehouse',
    Icon: Product
  },

  {
    name: 'Carrier',
    listPath: ['/carriers'],
    path: '/carriers',
    Icon: Product
  },
  {
    name: 'PO',
    listPath: ['/orders'],
    Icon: Product,
    path: '/orders'
  },
  {
    name: 'Daily Pick List',
    listPath: ['/daily-pick-list'],
    Icon: Product,
    path: '/daily-pick-list'
  },
  {
    name: 'Box',
    Icon: Product,
    listPath: ['/box'],
    path: '/box'
  },
  {
    name: 'More',
    Icon: PO,
    path: '/more',
    listPath: ['/barcode-size', '/gs1'],
    subMenu: [
      {
        name: 'Barcode Size',
        Icon: Product,
        path: '/barcode-size'
      },
      {
        name: 'GS1',
        Icon: Product,
        path: '/gs1'
      }
    ]
  }
];

export const tabletMain: Menu[] = [
  {
    name: 'Dashboard',
    Icon: Dashboard,
    path: '/dashboard'
  },
  {
    name: 'Product',
    Icon: Product,
    path: '/product'
  },
  {
    name: 'PO',
    Icon: PO,
    path: '/po'
  }
];

export const tabletExtra: Menu[] = [
  {
    name: 'Marketplace',
    Icon: Marketplace,
    path: '/marketplace'
  },
  {
    name: 'Settings',
    Icon: Settings,
    path: '/settings'
  },
  {
    name: 'User Manager',
    Icon: UserManager,
    path: '/user-manager'
  },
  {
    name: 'Admin',
    Icon: Admin,
    path: '/admin'
  }
];
