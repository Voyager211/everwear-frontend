import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../context/useStore'
import { formatPrice } from '../../lib/format'
import { Drawer, Modal } from '../ui'
import './Cart.css'

export function CartDrawer() {
  const { lines, cartOpen, closeCart, setQuantity, removeLine, subtotal, count } = useStore()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <>
      <Drawer
        open={cartOpen}
        onClose={closeCart}
        title={`Shopping bag (${count})`}
        footer={
          lines.length > 0 && (
            <>
              <div className="cart__total">
                <span>Total</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="cart__note muted">Shipping and taxes calculated at checkout.</p>
              <button type="button" className="btn btn--sm" onClick={() => setCheckoutOpen(true)}>
                Checkout
              </button>
            </>
          )
        }
      >
        {lines.length === 0 ? (
          <div className="cart__empty">
            <p>Your shopping bag is empty.</p>
            <Link to="/shop" className="link-underline caps" onClick={closeCart}>
              Continue shopping
            </Link>
          </div>
        ) : (
          <ul className="cart__list">
            {lines.map((line) => {
              const colour = line.product.colors.find((c) => c.key === line.colorKey)
              return (
                <li key={line.key} className="cart__line">
                  <Link to={`/product/${line.product.slug}`} onClick={closeCart} className="cart__thumb band">
                    <img src={colour?.packshot} alt="" />
                  </Link>
                  <div className="cart__detail">
                    <Link to={`/product/${line.product.slug}`} onClick={closeCart} className="cart__name caps">
                      {line.product.name}
                    </Link>
                    <p className="muted">
                      {colour?.name} &middot; Size {line.size}
                    </p>
                    <div className="cart__qty">
                      <button type="button" onClick={() => setQuantity(line.key, line.quantity - 1)} aria-label="Decrease">
                        &minus;
                      </button>
                      <span>{line.quantity}</span>
                      <button type="button" onClick={() => setQuantity(line.key, line.quantity + 1)} aria-label="Increase">
                        +
                      </button>
                    </div>
                    <div className="cart__linefoot">
                      <strong>{formatPrice(line.product.price * line.quantity)}</strong>
                      <button type="button" className="link-underline" onClick={() => removeLine(line.key)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Drawer>

      <Modal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Checkout">
        <p>
          This is a front-end demo — there is no payment step. The bag, wishlist, filters and product
          data are all running locally in the browser.
        </p>
      </Modal>
    </>
  )
}
