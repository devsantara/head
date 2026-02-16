import { describe, it, expect } from 'vitest';
import type { Brand, Product, Organization, Person } from 'schema-dts';
import { SchemaOrgBuilder } from '../index';

describe('SchemaOrgBuilder', () => {
  describe('instance creation', () => {
    it('should create instance without baseUrl', () => {
      const schema = new SchemaOrgBuilder();
      expect(schema).toBeInstanceOf(SchemaOrgBuilder);
    });

    it('should create instance with baseUrl', () => {
      const schema = new SchemaOrgBuilder(new URL('https://devsantara.com'));
      expect(schema).toBeInstanceOf(SchemaOrgBuilder);
    });
  });

  describe('add()', () => {
    it('should add entity with static value', () => {
      const schema = new SchemaOrgBuilder().add('brand', {
        '@type': 'Brand',
        name: 'My Brand',
      });

      const result = JSON.parse(schema.build());
      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Brand',
        name: 'My Brand',
      });
    });

    it('should add entity with @id', () => {
      const schema = new SchemaOrgBuilder().add('brand', {
        '@type': 'Brand',
        '@id': 'https://devsantara.com/#brand',
        name: 'My Brand',
      });

      const result = JSON.parse(schema.build());
      expect(result['@id']).toBe('https://devsantara.com/#brand');
    });

    it('should add entity with callback function', () => {
      const schema = new SchemaOrgBuilder(
        new URL('https://devsantara.com'),
      ).add('brand', (_, helper) => ({
        '@type': 'Brand',
        '@id': helper.resolveUrl('/brand'),
        name: 'My Brand',
      }));

      const result = JSON.parse(schema.build());
      expect(result['@id']).toBe('https://devsantara.com/brand');
    });

    it('should return builder for chaining', () => {
      const schema = new SchemaOrgBuilder();
      const result = schema.add('brand', { '@type': 'Brand' });
      expect(result).toBeInstanceOf(SchemaOrgBuilder);
    });

    it('should throw error when adding duplicate key', () => {
      const schema = new SchemaOrgBuilder().add('brand', { '@type': 'Brand' });

      expect(() => {
        // @ts-expect-error - testing duplicate key error handling
        schema.add('brand', { '@type': 'Brand' });
      }).toThrow('Schema key "brand" already exists in the graph.');
    });

    it('should allow adding multiple entities with different keys', () => {
      const schema = new SchemaOrgBuilder()
        .add('brand', { '@type': 'Brand', name: 'Brand A' })
        .add('product', { '@type': 'Product', name: 'Product B' });

      const result = JSON.parse(schema.build());
      expect(result['@graph']).toHaveLength(2);
    });
  });

  describe('build()', () => {
    describe('single entity', () => {
      it('should output single entity without @graph wrapper', () => {
        const schema = new SchemaOrgBuilder().add('brand', {
          '@type': 'Brand',
          name: 'My Brand',
        });

        const result = JSON.parse(schema.build());
        expect(result).toEqual({
          '@context': 'https://schema.org',
          '@type': 'Brand',
          name: 'My Brand',
        });
      });

      it('should include all entity properties', () => {
        const schema = new SchemaOrgBuilder().add('brand', {
          '@type': 'Brand',
          '@id': 'https://devsantara.com/#brand',
          name: 'My Brand',
          url: 'https://devsantara.com',
          description: 'A great brand',
        });

        const result = JSON.parse(schema.build());
        expect(result).toEqual({
          '@context': 'https://schema.org',
          '@type': 'Brand',
          '@id': 'https://devsantara.com/#brand',
          name: 'My Brand',
          url: 'https://devsantara.com',
          description: 'A great brand',
        });
      });
    });

    describe('multiple entities', () => {
      it('should output multiple entities with @graph wrapper', () => {
        const schema = new SchemaOrgBuilder()
          .add('brand', { '@type': 'Brand', name: 'Brand A' })
          .add('product', { '@type': 'Product', name: 'Product B' });

        const result = JSON.parse(schema.build());
        expect(result).toHaveProperty('@context', 'https://schema.org');
        expect(result).toHaveProperty('@graph');
        expect(result['@graph']).toHaveLength(2);
      });

      it('should maintain order of entities in graph', () => {
        const schema = new SchemaOrgBuilder()
          .add('first', { '@type': 'Brand', name: 'First' })
          .add('second', { '@type': 'Product', name: 'Second' })
          .add('third', { '@type': 'Organization', name: 'Third' });

        const result = JSON.parse(schema.build());
        expect(result['@graph'][0].name).toBe('First');
        expect(result['@graph'][1].name).toBe('Second');
        expect(result['@graph'][2].name).toBe('Third');
      });
    });
  });

  describe('entity references', () => {
    it('should support references between entities', () => {
      const schema = new SchemaOrgBuilder()
        .add('brand', {
          '@type': 'Brand',
          '@id': 'https://devsantara.com/#brand',
          name: 'My Brand',
        })
        .add('product', (ref) => ({
          '@type': 'Product',
          name: 'My Product',
          brand: { '@id': ref.brand.getID() },
        }));

      const result = JSON.parse(schema.build());
      expect(result['@graph'][1].brand['@id']).toBe(
        'https://devsantara.com/#brand',
      );
    });

    it('should access previously added entities in callback', () => {
      const schema = new SchemaOrgBuilder()
        .add('brand1', {
          '@type': 'Brand',
          '@id': 'https://devsantara.com/#brand1',
        })
        .add('manufactureOrg', {
          '@type': 'Organization',
          '@id': 'https://devsantara.com/#organization',
        })
        .add('product', (ref) => ({
          '@type': 'Product',
          brand: { '@id': ref.brand1.getID() },
          manufacturer: { '@id': ref.manufactureOrg.getID() },
        }));

      const result = JSON.parse(schema.build());
      expect(result['@graph'][2].brand['@id']).toBe(
        'https://devsantara.com/#brand1',
      );
      expect(result['@graph'][2].manufacturer['@id']).toBe(
        'https://devsantara.com/#organization',
      );
    });
  });

  describe('URL resolution', () => {
    it('should resolve relative URLs with baseUrl', () => {
      const schema = new SchemaOrgBuilder(
        new URL('https://devsantara.com'),
      ).add('brand', (_, helper) => ({
        '@type': 'Brand',
        '@id': helper.resolveUrl('/brand'),
        url: helper.resolveUrl('/'),
      }));

      const result = JSON.parse(schema.build());
      expect(result['@id']).toBe('https://devsantara.com/brand');
      expect(result.url).toBe('https://devsantara.com/');
    });

    it('should return URL as-is when no baseUrl provided', () => {
      const schema = new SchemaOrgBuilder().add('brand', (_, helper) => ({
        '@type': 'Brand',
        '@id': helper.resolveUrl('/brand'),
      }));

      const result = JSON.parse(schema.build());
      expect(result['@id']).toBe('/brand');
    });

    it('should handle URL objects in resolveUrl', () => {
      const schema = new SchemaOrgBuilder().add('brand', (_, helper) => ({
        '@type': 'Brand',
        '@id': helper.resolveUrl(new URL('https://devsantara.com/brand')),
      }));

      const result = JSON.parse(schema.build());
      expect(result['@id']).toBe('https://devsantara.com/brand');
    });

    it('should resolve relative paths correctly', () => {
      const schema = new SchemaOrgBuilder(
        new URL('https://devsantara.com/base/'),
      ).add('brand', (_, helper) => ({
        '@type': 'Brand',
        '@id': helper.resolveUrl('brand'),
        url: helper.resolveUrl('./page'),
      }));

      const result = JSON.parse(schema.build());
      expect(result['@id']).toBe('https://devsantara.com/base/brand');
      expect(result.url).toBe('https://devsantara.com/base/page');
    });

    it('should handle absolute URLs in resolveUrl with baseUrl', () => {
      const schema = new SchemaOrgBuilder(
        new URL('https://devsantara.com'),
      ).add('brand', (_, helper) => ({
        '@type': 'Brand',
        '@id': helper.resolveUrl('https://other.com/brand'),
      }));

      const result = JSON.parse(schema.build());
      expect(result['@id']).toBe('https://other.com/brand');
    });
  });

  describe('JSON-LD output format', () => {
    it('should return valid JSON string', () => {
      const schema = new SchemaOrgBuilder().add('brand', { '@type': 'Brand' });
      const output = schema.build();
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('should always include @context', () => {
      const schema = new SchemaOrgBuilder().add('brand', { '@type': 'Brand' });
      const result = JSON.parse(schema.build());
      expect(result['@context']).toBe('https://schema.org');
    });

    it('should preserve special characters in properties', () => {
      const schema = new SchemaOrgBuilder().add('brand', {
        '@type': 'Brand',
        name: 'Brand & Co. "Special"',
        description: "It's a <great> brand",
      });

      const result = JSON.parse(schema.build());
      expect(result.name).toBe('Brand & Co. "Special"');
      expect(result.description).toBe("It's a <great> brand");
    });
  });

  describe('schema-dts integration', () => {
    it('should work with Brand type from schema-dts', () => {
      const schema = new SchemaOrgBuilder<Brand>(
        new URL('https://devsantara.com'),
      ).add('brand', {
        '@type': 'Brand',
        '@id': 'https://devsantara.com/#brand',
        name: 'Devsantara',
        url: 'https://devsantara.com',
        logo: 'https://devsantara.com/logo.png',
        slogan: 'Building the future',
      });

      const result = JSON.parse(schema.build());
      expect(result['@type']).toBe('Brand');
      expect(result.name).toBe('Devsantara');
      expect(result.logo).toBe('https://devsantara.com/logo.png');
    });

    it('should work with Product type from schema-dts', () => {
      const schema = new SchemaOrgBuilder<Product>().add('product', {
        '@type': 'Product',
        name: 'TypeScript Library',
        description: 'A type-safe head builder',
        sku: 'TS-001',
        brand: {
          '@type': 'Brand',
          name: 'Devsantara',
        },
      });

      const result = JSON.parse(schema.build());
      expect(result['@type']).toBe('Product');
      expect(result.sku).toBe('TS-001');
      expect(result.brand.name).toBe('Devsantara');
    });

    it('should work with Organization type from schema-dts', () => {
      const schema = new SchemaOrgBuilder<Organization>().add('org', {
        '@type': 'Organization',
        name: 'Devsantara',
        url: 'https://devsantara.com',
        email: 'contact@devsantara.com',
        foundingDate: '2024-01-01',
      });

      const result = JSON.parse(schema.build());
      expect(result['@type']).toBe('Organization');
      expect(result.email).toBe('contact@devsantara.com');
      expect(result.foundingDate).toBe('2024-01-01');
    });

    it('should work with Person type from schema-dts', () => {
      const schema = new SchemaOrgBuilder<Person>().add('person', {
        '@type': 'Person',
        name: 'John Doe',
        jobTitle: 'Software Engineer',
        email: 'john@example.com',
        worksFor: {
          '@type': 'Organization',
          name: 'Devsantara',
        },
      });

      const result = JSON.parse(schema.build());
      expect(result['@type']).toBe('Person');
      expect(result.jobTitle).toBe('Software Engineer');
      expect(result.worksFor.name).toBe('Devsantara');
    });

    it('should work with multiple schema-dts types in graph', () => {
      const schema = new SchemaOrgBuilder<Brand | Product>(
        new URL('https://devsantara.com'),
      )
        .add('brand', {
          '@type': 'Brand',
          '@id': 'https://devsantara.com/#brand',
          name: 'Devsantara',
          logo: 'https://devsantara.com/logo.png',
        })
        .add('product', (ref) => ({
          '@type': 'Product',
          name: 'Head Library',
          brand: {
            '@id': ref.brand.getID(),
          },
        }));

      const result = JSON.parse(schema.build());
      expect(result['@graph']).toHaveLength(2);
      expect(result['@graph'][0]['@type']).toBe('Brand');
      expect(result['@graph'][1]['@type']).toBe('Product');
      expect(result['@graph'][1].brand['@id']).toBe(
        'https://devsantara.com/#brand',
      );
    });

    it('should support complex nested structures with schema-dts', () => {
      const schema = new SchemaOrgBuilder<Organization | Person>()
        .add('org', {
          '@type': 'Organization',
          '@id': 'https://devsantara.com/#org',
          name: 'Devsantara',
          url: 'https://devsantara.com',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '123 Tech Street',
            addressLocality: 'Tech City',
            addressCountry: 'TC',
          },
        })
        .add('founder', (ref) => ({
          '@type': 'Person',
          name: 'Jane Doe',
          jobTitle: 'Founder & CEO',
          worksFor: {
            '@id': ref.org.getID(),
          },
        }));

      const result = JSON.parse(schema.build());
      expect(result['@graph'][0].address['@type']).toBe('PostalAddress');
      expect(result['@graph'][0].address.streetAddress).toBe('123 Tech Street');
      expect(result['@graph'][1].worksFor['@id']).toBe(
        'https://devsantara.com/#org',
      );
    });

    it('should support URL resolution with schema-dts types', () => {
      const schema = new SchemaOrgBuilder<Brand>(
        new URL('https://devsantara.com'),
      ).add('brand', (_, helper) => ({
        '@type': 'Brand',
        '@id': helper.resolveUrl('/#brand'),
        name: 'Devsantara',
        url: helper.resolveUrl('/'),
        logo: helper.resolveUrl('/images/logo.png'),
      }));

      const result = JSON.parse(schema.build());
      expect(result['@id']).toBe('https://devsantara.com/#brand');
      expect(result.url).toBe('https://devsantara.com/');
      expect(result.logo).toBe('https://devsantara.com/images/logo.png');
    });
  });
});
