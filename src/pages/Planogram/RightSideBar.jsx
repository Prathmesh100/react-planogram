import { MoreVertical } from 'lucide-react'
import React from 'react'

const RightSideBar = ({selectedProduct}) => {
  return (
    <div style={{
          width: '320px',
          backgroundColor: 'white',
          borderLeft: '1px solid #e0e0e0',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Product Details
            </h3>
            <MoreVertical size={16} style={{ cursor: 'pointer', color: '#7f8c8d' }} />
          </div>

          {selectedProduct ? (
            <div>
              <div style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                border: '1px solid #e0e0e0',
                overflow: 'hidden'
              }}>
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '48px' }}>📦</div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#2c3e50'
                }}>
                  {selectedProduct.name}
                </h4>
                <div style={{
                  fontSize: '14px',
                  color: '#7f8c8d',
                  marginBottom: '8px'
                }}>
                  Brand: {selectedProduct.brand}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#27ae60'
                }}>
                  {selectedProduct.price}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#7f8c8d',
                  marginBottom: '4px'
                }}>
                  Description
                </div>
                <div style={{
                  fontSize: '13px',
                  lineHeight: '1.4',
                  color: '#2c3e50'
                }}>
                  {selectedProduct.description}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                    Width
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                    {(selectedProduct.width * 5)} {selectedProduct.dimensionUom}
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                    Height
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                    {selectedProduct.height * 5} {selectedProduct.dimensionUom}
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                    Facings
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                    {selectedProduct.total_facings} ({selectedProduct.facings_wide}×{selectedProduct.facings_high})
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                    Linear
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                    {selectedProduct.linear} cm
                  </div>
                </div>
              </div>

              <div style={{
                padding: '12px',
                backgroundColor: '#f0f8ff',
                borderRadius: '6px',
                border: '1px solid #e3f2fd'
              }}>
                <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '4px' }}>
                  Product Details
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#2c3e50' }}>
                  <div>ID: {selectedProduct.id}</div>
                  <div>TPNB: {selectedProduct.tpnb}</div>
                  <div>GTIN: {selectedProduct.gtin}</div>
                  <div>Orientation: {selectedProduct.orientation}°</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#7f8c8d',
              fontSize: '14px',
              marginTop: '40px'
            }}>
              Select a product to view details
            </div>
          )}
        </div>
  )
}

export default RightSideBar