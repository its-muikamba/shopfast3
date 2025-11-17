import React, { useMemo } from 'react';
import { Order, OrderStatus, Table, ServerAlert, Restaurant } from '../../types';
import { ArmchairIcon, CheckCircleIcon, ShoppingCartIcon } from '../Icons';

const statusColors: Record<OrderStatus, { bg: string, text: string, border: string }> = {
    'Pending': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500' },
    'Received': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
    'Preparing': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
    'On Route': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
    'Out for Delivery': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
    'Served': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-500' },
    'Delivered': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-500' },
    'Paid': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' },
    'Verified': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' },
};

const TableRepresentation: React.FC<{
    table: Table;
    order: Omit<Order, 'restaurant'> | undefined;
    alert: ServerAlert | undefined;
    onResolveAlert: (alertId: string) => void;
    onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}> = ({ table, order, alert, onResolveAlert, onUpdateOrderStatus }) => {

    const getStatusStyles = () => {
        if (alert) {
            return 'bg-red-500/10 border-red-500 shadow-lg animate-pulse-glow-red';
        }
        if (order?.status === 'On Route') {
             return 'bg-green-500/10 border-green-500 shadow-lg animate-pulse-glow-green';
        }
        if (order) {
            return 'bg-yellow-500/10 border-yellow-400';
        }
        return 'bg-surface border-border';
    };

    const statusText = alert ? "Needs Attention" : order ? "Occupied" : "Available";

    return (
        <div className={`rounded-lg border-2 p-3 flex flex-col justify-between transition-all duration-300 ${getStatusStyles()}`}>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-lg text-copy-rich">Table {table.number}</h3>
                    <span className="text-xs font-semibold text-copy-light">{statusText}</span>
                </div>
                <div className="flex items-center text-sm text-copy-light gap-3">
                    <div className="flex items-center">
                        <ArmchairIcon className="w-4 h-4 mr-1" />
                        <span>{table.capacity} seats</span>
                    </div>
                    <div className="flex items-center">
                        <ShoppingCartIcon className="w-4 h-4 mr-1" />
                        <span>{table.orderCount} orders</span>
                    </div>
                </div>
            </div>
            <div className="mt-2 border-t pt-2 space-y-2 border-border">
                {alert && (
                    <div className="bg-red-500/20 p-2 rounded-md">
                        <p className="text-sm font-bold text-red-500 text-center animate-pulse">{alert.request}</p>
                        <button onClick={() => onResolveAlert(alert.id)} className="w-full text-xs mt-2 bg-red-500 text-white font-semibold py-1 px-2 rounded-md hover:bg-red-600 transition">
                            Resolve
                        </button>
                    </div>
                )}
                {order && (
                     <div className="text-xs space-y-1 text-copy-light">
                        <p><strong>Order:</strong> {order.id.slice(-6)}</p>
                        <p><strong>Status:</strong> <span className={`font-semibold ${statusColors[order.status].text}`}>{order.status}</span></p>
                        {order.status === 'On Route' && (
                             <button onClick={() => onUpdateOrderStatus(order.id, 'Served')} className="w-full text-xs mt-1 bg-brand-emerald text-white font-semibold py-1 px-2 rounded-md hover:bg-opacity-80 transition flex items-center justify-center gap-1">
                                <CheckCircleIcon className="w-3 h-3" /> Mark as Served
                            </button>
                        )}
                     </div>
                )}
                {!order && !alert && (
                    <p className="text-xs text-center text-copy-lighter italic pt-2">Available</p>
                )}
            </div>
        </div>
    );
};

interface ServerViewProps {
  restaurant: Restaurant;
  liveOrders: Omit<Order, 'restaurant'>[];
  serverAlerts: ServerAlert[];
  onResolveAlert: (alertId: string) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const ServerView: React.FC<ServerViewProps> = ({ restaurant, liveOrders, serverAlerts, onResolveAlert, onUpdateOrderStatus }) => {
    
    const ordersByTable = useMemo(() => {
        return liveOrders.reduce((acc, order) => {
            if(order.tableNumber) {
                acc[order.tableNumber] = order;
            }
            return acc;
        }, {} as Record<number, Omit<Order, 'restaurant'>>);
    }, [liveOrders]);

     const alertsByTable = useMemo(() => {
        return serverAlerts.reduce((acc, alert) => {
            acc[alert.tableNumber] = alert;
            return acc;
        }, {} as Record<number, ServerAlert>);
    }, [serverAlerts]);

    const allTables = restaurant.tables.sort((a, b) => a.number - b.number);
    const mainDiningTables = allTables.filter(t => t.number <= 8);
    const patioTables = allTables.filter(t => t.number > 8);


    return (
        <div className="space-y-8">
            <style>
                {`
                    @keyframes pulse-glow-red {
                        0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                        50% { box-shadow: 0 0 10px 5px rgba(239, 68, 68, 0); }
                    }
                     @keyframes pulse-glow-green {
                        0%, 100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
                        50% { box-shadow: 0 0 10px 5px rgba(22, 163, 74, 0); }
                    }
                    .animate-pulse-glow-red { animation: pulse-glow-red 2s infinite; }
                    .animate-pulse-glow-green { animation: pulse-glow-green 2s infinite; }
                `}
            </style>
            <div>
                <h2 className="text-xl font-bold text-copy-rich mb-4 border-b pb-2 border-border">Main Dining</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {mainDiningTables.map(table => (
                        <TableRepresentation 
                            key={table.id}
                            table={table}
                            order={ordersByTable[table.number]}
                            alert={alertsByTable[table.number]}
                            onResolveAlert={onResolveAlert}
                            onUpdateOrderStatus={onUpdateOrderStatus}
                        />
                    ))}
                </div>
            </div>
             {patioTables.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-copy-rich mb-4 border-b pb-2 border-border">Patio</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {patioTables.map(table => (
                           <TableRepresentation 
                                key={table.id}
                                table={table}
                                order={ordersByTable[table.number]}
                                alert={alertsByTable[table.number]}
                                onResolveAlert={onResolveAlert}
                                onUpdateOrderStatus={onUpdateOrderStatus}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
};

export default ServerView;