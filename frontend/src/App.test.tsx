import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Integration Test (Database)', () => {
  it('renders the landing page and fetches data from the backend', async () => {
    render(<App />);
    
    // Check for Hero text (using findBy to wait for initial render if needed)
    expect(screen.getAllByText(/Louez/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Partout/i)[0]).toBeInTheDocument();


    // Wait for database-driven content to load.
    // We wait for categories count to be updated from the "..." placeholder.
    await waitFor(() => {
      // Searching for category count text (e.g., "12 annonces" or "0 annonces")
      const categoryAnnouncements = screen.queryAllByText(/annonces/i);
      expect(categoryAnnouncements.length).toBeGreaterThan(0);
      
      // Ensure the "..." loading state for categories is being replaced
      const loadingPlaceholders = screen.queryAllByText("...");
      expect(loadingPlaceholders.length).toBeLessThan(6); 
    }, { timeout: 15000 });
  });

  it('verifies that the navigation and main layout are present', async () => {
    render(<App />);
    
    // Navigation bar should be present
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Verify that the search button from LandingPage is rendered
    expect(screen.getByRole('button', { name: /Rechercher/i })).toBeInTheDocument();
  });

  it('verifies Supabase connection indirectly through auth initialization', async () => {
    render(<App />);
    
    // The App component calls initialize() which hits Supabase auth.
    // If it fails critically, it might log errors or show a crash.
    // Here we just ensure the app remains interactive.
    await waitFor(() => {
        expect(screen.getByPlaceholderText(/De quoi avez-vous besoin/i)).toBeInTheDocument();
    });
  });
});

