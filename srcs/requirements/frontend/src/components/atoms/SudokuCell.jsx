import React from 'react';
import styled from 'styled-components';

// STYLED COMPONENTS
const CellButton = styled.button`
    /* 1. KUSURSUZ KARE VE HİZALAMA */
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
    
    /* 2. ZIRH: Kenarlıklar (Border) hücrenin boyutunu bozup dışarı taşırmasın */
    box-sizing: border-box;

    /* 3. İŞTE ÇÖZÜM: FLUID FONT (Sıvı Tipografi)
       Min: 14px (Çok küçük telefonlarda okunabilirlik için)
       İdeal: 5vw (Ekranın %5'i kadar ol. Ekran daraldıkça font da daralır!)
       Max: 28px (Masaüstünde devasa olup çirkinleşmesin)
    */
    font-size: clamp(14px, 5vw, 28px);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    
    /* Font kalınlığı: Sabit rakamlar kalın, kullanıcının girdikleri biraz daha ince */
    font-weight: ${props => (props.$isFixed ? '800' : '500')};

    /* RENKLENDİRME (Mevcut mantığını koruyarak) */
    color: ${props => {
        if (props.$isError) return '#e74c3c'; // Kırmızı (Hata)
        if (props.$isFixed) return '#2c3e50'; // Koyu Lacivert (Başlangıç rakamları)
        return '#2980b9'; // Mavi (Senin yazdığın rakamlar)
    }};

    background-color: ${props => {
        if (props.$isSelected) return '#bbdefb'; // Seçili hücre
        if (props.$isHighlighted) return '#e3f2fd'; // Seçili hücrenin satır/sütunu
        if (props.$isSameNumber) return '#c8e6c9'; // Tahtadaki aynı rakamlar
        return '#ffffff'; // Standart boş hücre
    }};

    /* 4. KALIN 3x3 SINIRLARI (SudokuBoard'dan gelen proplar ile) */
    border: none;
    border-right: ${props => (props.$isThickRight ? '3px solid #2c3e50' : '1px solid #bdc3c7')};
    border-bottom: ${props => (props.$isThickBottom ? '3px solid #2c3e50' : '1px solid #bdc3c7')};

    cursor: pointer;
    transition: background-color 0.1s ease;
    outline: none;

    /* Tıklanma (Focus) esnasında çirkin mavi çerçeveyi engeller */
    &:focus {
        outline: none;
    }

    @media (max-width: 768px) {
        /* Mobilde font oranını çok hafif ayarlıyoruz */
        font-size: clamp(16px, 6vw, 24px);
    }
`;

// COMPONENT DEFINITION
const SudokuCell = ({ 
    value, 
    isFixed, 
    isError, 
    isSelected, 
    isHighlighted, 
    isSameNumber, 
    onClick,
    $isThickRight,
    $isThickBottom
}) => {
    return (
        <CellButton
            onClick={onClick}
            $isFixed={isFixed}
            $isError={isError}
            $isSelected={isSelected}
            $isHighlighted={isHighlighted}
            $isSameNumber={isSameNumber}
            $isThickRight={$isThickRight}
            $isThickBottom={$isThickBottom}
        >
            {value !== 0 ? value : ''}
        </CellButton>
    );
};

export default SudokuCell;