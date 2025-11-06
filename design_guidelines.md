# Employee Onboarding Interface Design Guidelines

## Design Approach
**Reference-Based Approach**: SharePoint-inspired professional interface design
Drawing from Microsoft's enterprise design language with clean, structured layouts optimized for productivity and information density.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Primary Blue: 220 85% 35% (SharePoint-style navigation and headers)
- Light Blue: 220 85% 95% (section backgrounds and highlights)
- White: 0 0% 100% (main backgrounds)

**Supporting Colors:**
- Text Primary: 0 0% 15% (main content text)
- Text Secondary: 0 0% 45% (secondary information)
- Border Gray: 0 0% 85% (dividers and card borders)
- Success Green: 142 70% 40% (completion indicators)

### Typography
- **Primary Font**: 'Segoe UI', system-ui, sans-serif
- **Header Sizes**: text-2xl for main titles, text-lg for section headers
- **Body Text**: text-sm for content, text-xs for metadata
- **Font Weights**: font-semibold for headers, font-normal for body

### Layout System
**Spacing Units**: Consistent use of Tailwind units 2, 4, 6, and 8
- **Container**: max-width with padding p-6
- **Card Spacing**: p-4 internal padding, mb-6 between sections
- **Grid Gaps**: gap-6 for main layout, gap-4 for card grids

### Component Library

**Navigation Header**:
- Full-width blue header (220 85% 35%) with white text
- Company logo left-aligned, user profile right-aligned
- Breadcrumb navigation below header

**Dashboard Cards**:
- White background with subtle border (border-gray-200)
- Rounded corners (rounded-lg)
- Header with icon and title, content area with list items
- Hover state with subtle shadow elevation

**Progress Indicators**:
- Horizontal progress bars with blue fill
- Checkmark icons for completed items using success green
- Percentage completion display

**Role-Based Content Areas**:
- Distinct visual hierarchy based on user permissions
- Disabled state styling for restricted content
- Clear visual indicators for access levels

**Quick Access Tiles**:
- Grid layout with consistent sizing
- Icon + label format
- Blue accent on hover state

### Specific Sections

**Hero Welcome Area**:
- Prominent welcome message with user's name
- Company onboarding video embed (16:9 aspect ratio)
- Blue background gradient overlay

**Onboarding Checklist**:
- Step-by-step progress tracker
- Expandable sections for detailed tasks
- Due date indicators with color coding

**Resource Library**:
- Categorized document access
- Search and filter functionality
- Download/view permissions based on role

**Learning Portal**:
- Course thumbnails in card format
- Progress tracking per course
- Role-appropriate content filtering

### Images
**Company Logo**: Top navigation header, standard corporate branding size
**User Avatars**: Circular profile images in navigation and employee directory
**Course Thumbnails**: Rectangular placeholder images for training materials
**No Large Hero Image**: Interface focuses on functional dashboard layout

### Accessibility & Interaction
- High contrast ratios for text readability
- Focus indicators for keyboard navigation
- Role-based content with clear visual hierarchy
- Responsive grid system for mobile compatibility
- Loading states for dynamic content areas

This design creates a professional, SharePoint-inspired onboarding experience that balances corporate aesthetics with modern usability standards.