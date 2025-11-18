import React, { useMemo, useState, useEffect } from 'react';
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

const TableGraphic: React.FC<{ capacity: number; tableNumber: number; colorClass?: string }> = ({ capacity, tableNumber, colorClass = 'text-copy-light' }) => {
    const topChairsCount = Math.ceil(capacity / 2);
    const bottomChairsCount = Math.floor(capacity / 2);

    return (
        <div className="flex flex-col items-center justify-center p-2">
            <div className={`flex gap-1 ${colorClass} transition-colors duration-300`}>
                {Array.from({ length: topChairsCount }).map((_, i) => <ArmchairIcon key={`top-${i}`} className="w-5 h-5" />)}
            </div>
            <div className={`w-full h-10 my-1 bg-surface rounded-lg flex items-center justify-center font-bold text-lg border transition-colors duration-300 ${colorClass} ${colorClass === 'text-copy-light' ? 'border-border text-copy-rich' : 'border-current'}`}>
                {tableNumber}
            </div>
            <div className={`flex gap-1 ${colorClass} transition-colors duration-300`}>
                {Array.from({ length: bottomChairsCount }).map((_, i) => <ArmchairIcon key={`bottom-${i}`} className="w-5 h-5" />)}
            </div>
        </div>
    );
};


const TableRepresentation: React.FC<{
    table: Table;
    order: Omit<Order, 'restaurant'> | undefined;
    alert: ServerAlert | undefined;
    onResolveAlert: (alertId: string) => void;
    onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
    onResetTable: (orderId: string) => void;
}> = ({ table, order, alert, onResolveAlert, onUpdateOrderStatus, onResetTable }) => {

    const getStatusStyles = () => {
        if (alert) {
            return 'bg-brand-orange/10 border-brand-orange shadow-lg animate-pulse-glow-orange';
        }
        if (order?.paymentStatus === 'paid') {
            return 'bg-emerald-500/10 border-emerald-500';
        }
        if (order?.status === 'Served') {
             return 'bg-emerald-500/10 border-emerald-500';
        }
        if (order?.status === 'On Route') {
             return 'bg-green-500/10 border-green-500';
        }
        if (order) {
            return 'bg-yellow-500/10 border-yellow-400';
        }
        return 'bg-surface border-border';
    };

    const graphicColorClass = useMemo(() => {
        if (alert) return 'text-brand-orange';
        if (order?.paymentStatus === 'paid') return 'text-emerald-500';
        if (order?.status === 'Served') return 'text-emerald-500';
        if (order?.status === 'On Route') return 'text-green-500';
        if (order) return 'text-yellow-500';
        return 'text-copy-light';
    }, [order, alert]);

    const totalItems = useMemo(() => {
        if (!order) return 0;
        return order.items.reduce((sum, item) => sum + item.quantity, 0);
    }, [order]);

    const statusText = alert ? "Needs Attention" 
        : order?.paymentStatus === 'paid' ? "Paid"
        : order?.status === 'Served' ? 'Served' 
        : order ? "Occupied" 
        : "Available";
    
    const [elapsedTime, setElapsedTime] = useState<string | null>(null);

    useEffect(() => {
        let intervalId: number;
        if (order && order.acceptedAt && order.status !== 'Served') {
            const updateTimer = () => {
                const elapsedSeconds = Math.floor((Date.now() - order.acceptedAt!) / 1000);
                const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
                const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
                setElapsedTime(`${mins}:${secs}`);
            };
            updateTimer();
            intervalId = window.setInterval(updateTimer, 1000);
        } else {
            setElapsedTime(null);
        }
        return () => window.clearInterval(intervalId);
    }, [order]);


    return (
        <div className={`rounded-lg border-2 p-3 flex flex-col justify-between transition-all duration-300 ${getStatusStyles()}`}>
            <TableGraphic capacity={table.capacity} tableNumber={table.number} colorClass={graphicColorClass} />
            
            <div className="mt-2 border-t pt-2 space-y-2 border-border text-center">
                 <span className="text-xs font-semibold text-copy-light">{statusText}</span>
                {alert && (
                    <div className="bg-brand-orange/20 p-2 rounded-md">
                        <p className="text-sm font-bold text-brand-orange text-center animate-pulse">{alert.request}</p>
                        <button onClick={() => onResolveAlert(alert.id)} className="w-full text-xs mt-2 bg-brand-orange text-white font-semibold py-1 px-2 rounded-md hover:bg-opacity-80 transition">
                            Resolve
                        </button>
                    </div>
                )}
                {order && (
                     <div className="text-xs space-y-1 text-copy-light text-left">
                        <p><strong>Order:</strong> {order.id.slice(-6)} ({totalItems} items)</p>
                        <p><strong>Status:</strong> <span className={`font-semibold ${statusColors[order.status].text}`}>{order.status}</span></p>
                        {order.paymentStatus === 'paid' && order.paymentMethod && (
                           <p><strong>Payment:</strong> <span className="font-semibold capitalize text-emerald-600">Paid via {order.paymentMethod}</span></p>
                        )}
                         {elapsedTime && <p><strong>Time:</strong> <span className="font-mono">{elapsedTime}</span></p>}
                        {order.status === 'On Route' && (
                             <button onClick={() => onUpdateOrderStatus(order.id, 'Served')} className="w-full text-xs mt-1 bg-brand-emerald text-white font-semibold py-1 px-2 rounded-md hover:bg-opacity-80 transition flex items-center justify-center gap-1">
                                <CheckCircleIcon className="w-3 h-3" /> Mark as Served
                            </button>
                        )}
                         {order.status === 'Served' && (
                             <button onClick={() => onResetTable(order.id)} className="w-full text-xs mt-1 bg-copy-light text-white font-semibold py-1 px-2 rounded-md hover:bg-opacity-80 transition">
                                Clear & Reset Table
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
  onResetTable: (orderId: string) => void;
}

const ServerView: React.FC<ServerViewProps> = ({ restaurant, liveOrders, serverAlerts, onResolveAlert, onUpdateOrderStatus, onResetTable }) => {
    
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
                            onResetTable={onResetTable}
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
                                onResetTable={onResetTable}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
};

export default ServerView;
