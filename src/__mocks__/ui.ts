/**
 * Mock UI components for Testing
 */

import React from 'react'

export const Icon = jest.fn(({ name, ...props }: any) =>
  React.createElement('span', { 'data-testid': `icon-${name}`, ...props })
)

export const StatsPanel = jest.fn((props: any) =>
  React.createElement('div', { 'data-testid': 'stats-panel', ...props })
)

export const Pagination = jest.fn((props: any) =>
  React.createElement('div', { 'data-testid': 'pagination', ...props })
)

export const Drawer = jest.fn(({ children, ...props }: any) =>
  React.createElement('div', { 'data-testid': 'drawer', ...props }, children)
)

export const DrawerHeader = jest.fn((props: any) =>
  React.createElement('div', { 'data-testid': 'drawer-header', ...props })
)

export const DrawerContent = jest.fn((props: any) =>
  React.createElement('div', { 'data-testid': 'drawer-content', ...props })
)

export const DrawerFooter = jest.fn((props: any) =>
  React.createElement('div', { 'data-testid': 'drawer-footer', ...props })
)

export const ConfirmModal = jest.fn((props: any) =>
  props.isOpen
    ? React.createElement('div', { 'data-testid': 'confirm-modal', ...props })
    : null
)

