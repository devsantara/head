import { describe, it, expect } from 'vitest';
import type { Brand, Product } from 'schema-dts';
import { HeadBuilder } from '../builder';
import { SchemaOrgBuilder } from '../schema-org';
import type { HeadElement } from '../types';

describe('HeadBuilder.addSchemaOrg', () => {
  it('should add single entity schema as JSON-LD script', () => {
    const schema = new SchemaOrgBuilder<Brand>().addEntity('brand', {
      '@type': 'Brand',
      name: 'My Brand',
      url: 'https://devsantara.com',
    });

    const result = new HeadBuilder().addSchemaOrg(schema).build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'script',
      attributes: {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Brand',
          name: 'My Brand',
          url: 'https://devsantara.com',
        }),
      },
    });
  });

  it('should add multi-entity schema with @graph', () => {
    const schema = new SchemaOrgBuilder<Brand | Product>()
      .addEntity('brand', {
        '@type': 'Brand',
        '@id': 'https://devsantara.com/#brand',
        name: 'My Brand',
      })
      .addEntity('product', (ref) => ({
        '@type': 'Product',
        name: 'My Product',
        brand: { '@id': ref.brand.getID() },
      }));

    const result = new HeadBuilder<HeadElement<'script'>[]>()
      .addSchemaOrg(schema)
      .build();

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('script');
    expect(result[0].attributes.type).toBe('application/ld+json');

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const parsedChildren = JSON.parse(result[0].attributes.children as string);
    expect(parsedChildren['@context']).toBe('https://schema.org');
    expect(parsedChildren['@graph']).toHaveLength(2);
    expect(parsedChildren['@graph'][0]['@type']).toBe('Brand');
    expect(parsedChildren['@graph'][1]['@type']).toBe('Product');
  });

  it('should properly stringify schema with special characters', () => {
    const schema = new SchemaOrgBuilder<Brand>().addEntity('brand', {
      '@type': 'Brand',
      name: 'Brand "Quoted" & Special <chars>',
      description: "It's a test",
    });

    const result = new HeadBuilder().addSchemaOrg(schema).build();

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const parsedChildren = JSON.parse(result[0].attributes.children as string);
    expect(parsedChildren.name).toBe('Brand "Quoted" & Special <chars>');
    expect(parsedChildren.description).toBe("It's a test");
  });

  it('should return builder instance for chaining', () => {
    const schema = new SchemaOrgBuilder<Brand>().addEntity('brand', {
      '@type': 'Brand',
      name: 'My Brand',
    });

    const builder = new HeadBuilder();
    const result = builder.addSchemaOrg(schema);

    expect(result).toBe(builder);
  });

  it('should allow chaining with other head elements', () => {
    const schema = new SchemaOrgBuilder<Brand>().addEntity('brand', {
      '@type': 'Brand',
      name: 'My Brand',
    });

    const result = new HeadBuilder()
      .addTitle('My Page')
      .addSchemaOrg(schema)
      .addDescription('Page description')
      .build();

    expect(result).toHaveLength(3);
    expect(result[0].type).toBe('title');
    expect(result[1].type).toBe('script');
    expect(result[2].type).toBe('meta');
  });

  it('should handle schema with baseUrl resolution', () => {
    const schema = new SchemaOrgBuilder<Brand>(
      new URL('https://devsantara.com'),
    ).addEntity('brand', (_, helper) => ({
      '@type': 'Brand',
      '@id': helper.resolveUrl('/#brand'),
      url: helper.resolveUrl('/'),
      name: 'My Brand',
    }));

    const result = new HeadBuilder().addSchemaOrg(schema).build();

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const parsedChildren = JSON.parse(result[0].attributes.children as string);
    expect(parsedChildren['@id']).toBe('https://devsantara.com/#brand');
    expect(parsedChildren.url).toBe('https://devsantara.com/');
  });

  it('should allow adding multiple different schemas', () => {
    const schema1 = new SchemaOrgBuilder<Brand>().addEntity('brand', {
      '@type': 'Brand',
      name: 'First Brand',
    });

    const schema2 = new SchemaOrgBuilder<Product>().addEntity('product', {
      '@type': 'Product',
      name: 'My Product',
    });

    const result = new HeadBuilder()
      .addSchemaOrg(schema1)
      .addSchemaOrg(schema2)
      .build();

    // Scripts don't auto-replace
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('script');
    expect(result[1].type).toBe('script');
  });
});
