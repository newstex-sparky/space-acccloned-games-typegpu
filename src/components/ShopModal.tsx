import { useState } from 'react';
import type { GameEngine } from '../engine/GameEngine';
import { ITEMS, SHOP_STOCK, DECORATION_LIST, getItemBuyValue, getItemSellValue } from '../engine/items';

interface Props {
  engine: GameEngine;
  onClose: () => void;
}

export function ShopModal({ engine, onClose }: Props) {
  const [, forceUpdate] = useState({});
  const [tab, setTab] = useState<'buy' | 'sell' | 'deco' | 'furniture'>('buy');
  const refresh = () => forceUpdate({});

  const furnitureItems = SHOP_STOCK.filter(s => ITEMS[s.itemId]?.category === 'furniture');
  const buyItems = SHOP_STOCK.filter(s => ITEMS[s.itemId]?.category !== 'furniture');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal shop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏪 Galactic Trading Post</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="shop-tabs">
            <button className={`tab ${tab === 'buy' ? 'active' : ''}`} onClick={() => setTab('buy')}>Buy</button>
            <button className={`tab ${tab === 'sell' ? 'active' : ''}`} onClick={() => setTab('sell')}>Sell</button>
            <button className={`tab ${tab === 'deco' ? 'active' : ''}`} onClick={() => setTab('deco')}>Decorate</button>
            <button className={`tab ${tab === 'furniture' ? 'active' : ''}`} onClick={() => setTab('furniture')}>Furniture</button>
          </div>

          <div className="shop-money">💰 {engine.player.stats.money}g</div>

          {tab === 'buy' && (
            <div className="shop-list">
              {buyItems.map((stock, i) => {
                const item = ITEMS[stock.itemId];
                if (!item) return null;
                const price = getItemBuyValue(stock.itemId);
                return (
                  <div key={i} className="shop-item">
                    <span className="shop-item-icon">{item.emoji}</span>
                    <div className="shop-item-info">
                      <span className="shop-item-name">{item.name}</span>
                      <span className="shop-item-desc">{item.description}</span>
                    </div>
                    <span className="shop-item-price">{price}g</span>
                    <button
                      className="btn btn-buy"
                      disabled={engine.player.stats.money < price}
                      onClick={() => { engine.buyItem(stock.itemId, 1); refresh(); }}
                    >
                      Buy
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'sell' && (
            <div className="shop-list">
              {engine.player.inventory.map((slot, i) => {
                if (!slot.item) return null;
                const item = ITEMS[slot.item.itemId];
                if (!item || item.sellValue <= 0) return null;
                return (
                  <div key={i} className="shop-item">
                    <span className="shop-item-icon">{item.emoji}</span>
                    <div className="shop-item-info">
                      <span className="shop-item-name">{item.name} x{slot.item.quantity}</span>
                      <span className="shop-item-desc">{item.description}</span>
                    </div>
                    <span className="shop-item-price">{getItemSellValue(slot.item.itemId)}g</span>
                    <button
                      className="btn btn-sell"
                      onClick={() => { engine.sellItem(slot.item!.itemId, 1); refresh(); }}
                    >
                      Sell 1
                    </button>
                    <button
                      className="btn btn-sell"
                      onClick={() => { engine.sellItem(slot.item!.itemId, slot.item!.quantity); refresh(); }}
                    >
                      All
                    </button>
                  </div>
                );
              })}
              {engine.player.inventory.every(s => !s.item || ITEMS[s.item.itemId]?.sellValue <= 0) && (
                <div className="shop-empty">Nothing to sell. Harvest some crops!</div>
              )}
            </div>
          )}

          {tab === 'deco' && (
            <div className="shop-list">
              <p className="deco-hint">Buy and place decorations on your farm!</p>
              {DECORATION_LIST.map((dec) => (
                <div key={dec.id} className="shop-item">
                  <span className="shop-item-icon" style={{ color: dec.color }}>●</span>
                  <div className="shop-item-info">
                    <span className="shop-item-name">{dec.name}</span>
                    <span className="shop-item-desc">{dec.category}</span>
                  </div>
                  <span className="shop-item-price">{dec.cost}g</span>
                  <button
                    className="btn btn-buy"
                    disabled={engine.player.stats.money < dec.cost}
                    onClick={() => { engine.buyDecoration(dec.id); refresh(); }}
                  >
                    Place
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'furniture' && (
            <div className="shop-list">
              <p className="deco-hint">Buy furniture, then select it in your Bag and tap "Place" inside your house!</p>
              {furnitureItems.map((stock, i) => {
                const item = ITEMS[stock.itemId];
                if (!item) return null;
                const price = getItemBuyValue(stock.itemId);
                return (
                  <div key={i} className="shop-item">
                    <span className="shop-item-icon">{item.emoji}</span>
                    <div className="shop-item-info">
                      <span className="shop-item-name">{item.name}</span>
                      <span className="shop-item-desc">{item.description}</span>
                    </div>
                    <span className="shop-item-price">{price}g</span>
                    <button
                      className="btn btn-buy"
                      disabled={engine.player.stats.money < price}
                      onClick={() => { engine.buyItem(stock.itemId, 1); refresh(); }}
                    >
                      Buy
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}